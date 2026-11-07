/**
 * 프론트엔드 데이터 접근 계층.
 * 현재는 Mock Data를 반환합니다. 백엔드 API가 준비되면 각 함수 내부만
 * `fetch('/api/...')` 호출로 교체하면 컴포넌트는 수정할 필요가 없습니다.
 */
import type {
  AdminSummary,
  AiReading,
  Building,
  CitizenReport,
  InspectionStatus,
  PatrolScreenshot,
  ReportDraft,
  ReportReceipt,
  StatusUpdateResult,
  ZoneSelection,
} from '../types'
import {
  MOCK_AI_READING,
  MOCK_BUILDINGS,
  MOCK_DONGS,
  MOCK_PATROL_SCREENSHOTS,
  MOCK_RECALCULATED_SCORE,
  MOCK_REPORTS,
  MOCK_SUMMARY,
} from '../mock/data'

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

const buildings = MOCK_BUILDINGS.map((b) => ({ ...b }))

// ───────── 시민 제보 ─────────

/** 좌표를 시민용 구역 이름으로 변환 (백엔드 역지오코딩 대체) */
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
  await delay(200)
  return MOCK_SUMMARY
}

export async function getBuildings(): Promise<Building[]> {
  await delay(300)
  return buildings.map((b) => ({ ...b }))
}

export async function getBuildingReports(buildingId: string): Promise<CitizenReport[]> {
  await delay(200)
  return MOCK_REPORTS.filter((r) => r.buildingId === buildingId)
}

export async function uploadInspectionPhotos(
  buildingId: string,
  files: File[],
): Promise<{ uploaded: number }> {
  await delay(800)
  return { uploaded: files.length }
}

/** AI 판독은 백엔드가 수행. 프론트는 결과만 받아서 표시 */
export async function getAiReading(buildingId: string): Promise<AiReading> {
  await delay(1200)
  return MOCK_AI_READING(buildingId)
}

/** 점수 계산은 백엔드가 수행. 프론트는 상태만 전달하고 결과 점수를 받음 */
export async function updateBuildingStatus(
  buildingId: string,
  inspectionStatus: InspectionStatus,
): Promise<StatusUpdateResult> {
  await delay(700)
  const target = buildings.find((b) => b.id === buildingId)
  if (!target) throw new Error('건물을 찾을 수 없습니다')
  target.inspectionStatus = inspectionStatus
  target.lastInspectedAt = new Date().toISOString().slice(0, 10)
  if (MOCK_RECALCULATED_SCORE[buildingId] !== undefined) {
    target.sosScore = MOCK_RECALCULATED_SCORE[buildingId]
  }
  return {
    buildingId,
    sosScore: target.sosScore,
    inspectionStatus,
    updatedAt: new Date().toISOString(),
  }
}

// ───────── 순찰대 ─────────

export async function getPatrolScreenshots(): Promise<PatrolScreenshot[]> {
  return MOCK_PATROL_SCREENSHOTS
}
