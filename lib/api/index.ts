/**
 * 프론트엔드 데이터 접근 계층.
 * 별도 백엔드 없이 브라우저 메모리에서 상태를 관리한다(docs/개발명세.md).
 * - 빈집: data/houses.json(실제 공람안 158호 → 방문지 130곳)
 * - 색: lib/sos.ts 규칙으로 계산
 * - AI 판독: 다음 단계에서 /api/analyze(Gemini, 캐시 폴백)로 교체
 */
import housesRaw from '../data/houses.json'
import { AS_OF, calculateSos, compareSos, type HazardStage } from '../sos'
import type {
  AdminSummary,
  AiReading,
  Building,
  CitizenReport,
  PatrolScreenshot,
  ReportDraft,
  ReportReceipt,
  ZoneSelection,
} from '../types'
import { MOCK_AI_READING, MOCK_DONGS, MOCK_PATROL_SCREENSHOTS, MOCK_REPORTS } from '../mock/data'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

interface RawHouse {
  id: string
  dong: string
  jibun: string
  lat: number
  lng: number
  units: number
  codes: string[]
  types: string[]
  grade: number
  plan: string
  planYear: string
  exposure: { facility: boolean; cluster: boolean; density: boolean }
  exposureCount: number
  cycleMonths: number
  lastChecked: string
  hazardStage: string | number | null
  actionDone: boolean
  timeline: { date: string; type: string; note: string }[]
}

type BaseBuilding = Omit<Building, 'sos' | 'reportCount'>

function fromRaw(h: RawHouse): BaseBuilding {
  return {
    id: h.id,
    address: `${h.dong} ${h.jibun}`,
    dong: h.dong,
    jibun: h.jibun,
    lat: h.lat,
    lng: h.lng,
    units: h.units,
    codes: h.codes,
    types: h.types,
    grade: h.grade,
    plan: h.plan,
    planYear: h.planYear,
    exposure: h.exposure,
    exposureCount: h.exposureCount,
    cycleMonths: h.cycleMonths === 6 ? 6 : 12,
    lastChecked: h.lastChecked,
    // houses.json의 '시판정' = 정비방식 안전조치·철거 → cityPending으로 읽는다
    hazardStage: typeof h.hazardStage === 'number' ? (h.hazardStage as HazardStage) : null,
    cityPending: h.hazardStage === '시판정',
    actionDone: h.actionDone,
    timeline: [...h.timeline],
  }
}

/** 브라우저 메모리 상태. 새로고침하면 처음 상태로 돌아간다(= 리셋). */
const state: { buildings: BaseBuilding[]; reports: CitizenReport[] } = {
  buildings: (housesRaw as RawHouse[]).map(fromRaw),
  reports: MOCK_REPORTS.map((r) => ({ ...r })),
}

function withSos(b: BaseBuilding): Building {
  return {
    ...b,
    sos: calculateSos(b),
    reportCount: state.reports.filter((r) => r.buildingId === b.id).length,
  }
}

function findBase(id: string): BaseBuilding {
  const b = state.buildings.find((x) => x.id === id)
  if (!b) throw new Error('빈집을 찾을 수 없습니다')
  return b
}

// ───────── 시민 제보 ─────────

/** 좌표를 시민용 구역 이름으로 변환 (역지오코딩 대체) */
export async function resolveZone(lat: number, lng: number): Promise<ZoneSelection> {
  await delay(150)
  const nearest = MOCK_DONGS.reduce((acc, d) =>
    (d.lat - lat) ** 2 + (d.lng - lng) ** 2 < (acc.lat - lat) ** 2 + (acc.lng - lng) ** 2 ? d : acc,
  )
  return { zoneLabel: `${nearest.name} 일대`, lat, lng }
}

export async function submitReport(draft: ReportDraft): Promise<ReportReceipt> {
  await delay(700)
  if (!draft.category || !draft.zone) throw new Error('필수 항목 누락')
  return {
    receiptNo: `R-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`,
    category: draft.category,
    zoneLabel: draft.zone.zoneLabel,
    status: 'received',
  }
}

// ───────── 시 담당자 ─────────

export async function getAdminSummary(): Promise<AdminSummary> {
  await delay(100)
  const all = state.buildings.map(withSos)
  return {
    totalHouses: all.reduce((s, b) => s + b.units, 0),
    totalSites: all.length,
    newReports: state.reports.length,
    urgent: all.filter((b) => b.sos.level >= 2).length,
    orange: all.filter((b) => b.sos.color === 'ORANGE').length,
    green: all.filter((b) => b.sos.color === 'GREEN').length,
  }
}

/** 먼저 갈 곳 순서(색 → 피해 범위 → 기한 초과 일수)로 정렬해 돌려준다 */
export async function getBuildings(): Promise<Building[]> {
  await delay(150)
  return state.buildings.map(withSos).sort(compareSos)
}

export async function getBuildingReports(buildingId: string): Promise<CitizenReport[]> {
  await delay(100)
  return state.reports.filter((r) => r.buildingId === buildingId)
}

export async function uploadInspectionPhotos(buildingId: string, files: File[]): Promise<{ uploaded: number }> {
  await delay(500)
  return { uploaded: files.length }
}

/** AI 판독(지금은 예시 응답). 색은 정하지 않고 담당자 확정을 돕는다 */
export async function getAiReading(buildingId: string): Promise<AiReading> {
  await delay(1200)
  return MOCK_AI_READING(buildingId)
}

/** 담당자가 위해 단계를 확정한다. stage null = 이상 없음 */
export async function confirmInspection(buildingId: string, stage: HazardStage, journal: string): Promise<Building> {
  await delay(400)
  const b = findBase(buildingId)
  b.hazardStage = stage
  b.lastChecked = AS_OF
  b.actionDone = false
  b.timeline.push({
    date: AS_OF,
    type: '점검',
    note: stage ? `${stage}단계 위해 확정. ${journal}`.trim() : `이상 없음. ${journal}`.trim(),
  })
  return withSos(b)
}

/** 조치 완료: 초록, 다음 점검은 6개월 뒤 */
export async function completeAction(buildingId: string, note: string): Promise<Building> {
  await delay(400)
  const b = findBase(buildingId)
  b.actionDone = true
  b.hazardStage = null
  b.cityPending = false
  b.cycleMonths = 6
  b.lastChecked = AS_OF
  b.timeline.push({ date: AS_OF, type: '조치 완료', note: note || '1차 안전조치 완료' })
  return withSos(b)
}

// ───────── 순찰대 ─────────

export async function getPatrolScreenshots(): Promise<PatrolScreenshot[]> {
  return MOCK_PATROL_SCREENSHOTS
}
