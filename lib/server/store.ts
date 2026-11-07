/**
 * 서버 메모리 저장소(docs/개발명세.md 4장).
 * - 서버가 켜질 때 houses.json과 fixtures/initial-events.json을 읽어 globalThis에 둔다.
 *   그래야 라우트끼리 같은 상태를 보고, next dev 핫 리로드에도 남는다.
 * - 제보·연결·점검·조치는 이 상태를 바로 고치고 타임라인에 한 줄을 붙인다.
 * - 서버를 다시 켜면 처음 상태로 돌아간다(= 리셋).
 * 서버 전용 모듈이다. 화면 코드에서 import하지 않는다(빈집 위치가 시민 화면으로 새지 않게).
 */
import housesRaw from '@/lib/data/houses.json'
import initialEvents from '@/fixtures/initial-events.json'
import { addDays, daysBetween } from '@/lib/date'
import { cellBounds, gridCell } from '@/lib/grid'
import { categoryLabel, REPORT_CATEGORIES } from '@/lib/labels'
import { AS_OF, calculateSos, compareSos, type HazardStage, type SosColor } from '@/lib/sos'
import type { ReportCategory } from '@/lib/types'
import type {
  ActionResponse,
  InspectionResponse,
  Report,
  ReportReceiptResponse,
  ReportsResponse,
  ReportState,
  Site,
  SiteDetailResponse,
  SitesResponse,
  Summary,
  TimelineEntry,
  Zone,
  ZoneResolveResponse,
  ZoneSummary,
} from '@/lib/contracts'
import { badRequest, notFound } from './http'

/** 현장조사 기한: 접수일 + 30일 (빈집법 시행령 제10조의3) */
const REPORT_DUE_DAYS = 30

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

type SiteState = Omit<Site, 'sos' | 'reportCount' | 'latestReportAt' | 'openReportDueAt' | 'dDay'>
type ReportRecord = Omit<Report, 'dDay' | 'candidateSiteIds'>

interface Store {
  sites: SiteState[]
  byId: Map<string, SiteState>
  reports: ReportRecord[]
  nextSeq: number
}

// ───────── 초기화 ─────────

function fromRaw(h: RawHouse): SiteState {
  return {
    id: h.id,
    dong: h.dong,
    jibun: h.jibun,
    lat: h.lat,
    lng: h.lng,
    units: h.units,
    codes: [...h.codes],
    types: [...h.types],
    grade: h.grade,
    plan: h.plan,
    planYear: h.planYear,
    exposure: { ...h.exposure },
    exposureCount: h.exposureCount,
    cycleMonths: h.cycleMonths === 6 ? 6 : 12,
    lastChecked: h.lastChecked,
    // houses.json의 '시판정' = 정비방식 안전조치·철거 → cityPending(빨강 최소)
    hazardStage: typeof h.hazardStage === 'number' ? (h.hazardStage as HazardStage) : null,
    cityPending: h.hazardStage === '시판정',
    actionDone: h.actionDone,
    timeline: h.timeline.map((t) => ({ ...t, type: t.type as TimelineEntry['type'] })),
  }
}

function linkNote(r: ReportRecord): string {
  return `${r.id} ${categoryLabel(r.category)} 제보 연결: "${r.title}" (현장조사 기한 ${r.dueAt})`
}

function createStore(): Store {
  const sites = (housesRaw as RawHouse[]).map(fromRaw)
  const byId = new Map(sites.map((s) => [s.id, s]))
  const reports: ReportRecord[] = []

  for (const e of initialEvents.reports) {
    const site = byId.get(e.siteId)
    if (!site) {
      console.warn(`[store] 시연 제보 ${e.id}: 빈집 ${e.siteId}를 찾을 수 없어 건너뜀`)
      continue
    }
    const r: ReportRecord = {
      id: e.id,
      category: e.category as ReportCategory,
      title: e.title,
      description: e.description,
      photoCount: e.photoCount,
      zone: zoneFor(site.lat, site.lng, sites),
      createdAt: e.createdAt,
      dueAt: addDays(e.createdAt, REPORT_DUE_DAYS),
      status: 'LINKED',
      siteId: site.id,
      inspectedAt: null,
    }
    reports.push(r)
    site.timeline.push({ date: e.createdAt, type: '제보 연결', note: linkNote(r) })
  }

  const maxSeq = Math.max(0, ...reports.map((r) => Number(r.id.split('-').pop()) || 0))
  console.info(`[store] 메모리 상태 준비: 방문지 ${sites.length}곳, 시연 제보 ${reports.length}건 (기준일 ${AS_OF})`)
  return { sites, byId, reports, nextSeq: maxSeq + 1 }
}

const g = globalThis as typeof globalThis & { __voidStore?: Store }

function db(): Store {
  if (!g.__voidStore) g.__voidStore = createStore()
  return g.__voidStore
}

// ───────── 구역(250m 격자) ─────────

/** 가장 가까운 방문지의 법정동으로 구역 이름을 붙인다. 2km 안에 없으면 '안산시 일대' */
function zoneLabel(lat: number, lng: number, sites: SiteState[]): string {
  let best: SiteState | null = null
  let bestD = Infinity
  const kx = Math.cos((lat * Math.PI) / 180)
  for (const s of sites) {
    const d = (s.lat - lat) ** 2 + ((s.lng - lng) * kx) ** 2
    if (d < bestD) {
      bestD = d
      best = s
    }
  }
  const km = Math.sqrt(bestD) * 111
  return best && km <= 2 ? `${best.dong} 일대` : '안산시 일대'
}

function zoneFor(lat: number, lng: number, sites: SiteState[]): Zone {
  const c = gridCell(lat, lng)
  const center = { lat: (c.bounds[0][0] + c.bounds[1][0]) / 2, lng: (c.bounds[0][1] + c.bounds[1][1]) / 2 }
  return { id: c.id, label: zoneLabel(center.lat, center.lng, sites), bounds: c.bounds }
}

/** 구역 안 등록 빈집. 없으면 바로 옆 8칸까지 본다(명세 7.2). 자동 연결은 하지 않는다 */
function candidatesFor(zone: Zone, sites: SiteState[]): string[] {
  const [, row, col] = zone.id.split('-').map(Number)
  const inCell = (s: SiteState, r: number, c: number) => {
    const cell = gridCell(s.lat, s.lng)
    return cell.row === r && cell.col === c
  }
  const own = sites.filter((s) => inCell(s, row, col))
  if (own.length > 0) return own.map((s) => s.id)

  const [[la0, ln0], [la1, ln1]] = cellBounds(row, col)
  const center = { lat: (la0 + la1) / 2, lng: (ln0 + ln1) / 2 }
  return sites
    .filter((s) => {
      const cell = gridCell(s.lat, s.lng)
      return Math.abs(cell.row - row) <= 1 && Math.abs(cell.col - col) <= 1
    })
    .sort((a, b) => (a.lat - center.lat) ** 2 + (a.lng - center.lng) ** 2 - ((b.lat - center.lat) ** 2 + (b.lng - center.lng) ** 2))
    .map((s) => s.id)
}

// ───────── 보기(계산값 붙이기) ─────────

const isActive = (r: ReportRecord) => r.dueAt >= AS_OF

function siteView(s: SiteState, reports: ReportRecord[]): Site {
  const linked = reports.filter((r) => r.siteId === s.id)
  const pending = linked.filter((r) => r.status === 'LINKED' && r.inspectedAt === null).map((r) => r.dueAt)
  const openReportDueAt = pending.length > 0 ? pending.sort()[0] : null
  return {
    ...s,
    exposure: { ...s.exposure },
    timeline: [...s.timeline].sort((a, b) => a.date.localeCompare(b.date)),
    sos: calculateSos(s),
    reportCount: linked.length,
    latestReportAt: linked.length > 0 ? linked.map((r) => r.createdAt).sort().at(-1)! : null,
    openReportDueAt,
    dDay: openReportDueAt ? daysBetween(AS_OF, openReportDueAt) : null,
  }
}

function reportView(r: ReportRecord, sites: SiteState[]): Report {
  return {
    ...r,
    dDay: daysBetween(AS_OF, r.dueAt),
    candidateSiteIds: r.status === 'OPEN' ? candidatesFor(r.zone, sites) : [],
  }
}

function findSite(id: string): SiteState {
  const s = db().byId.get(id)
  if (!s) throw notFound(`빈집 ${id}를 찾을 수 없습니다`, 'SITE_NOT_FOUND')
  return s
}

function summaryOf(views: Site[], reports: ReportRecord[]): Summary {
  const byColor: Record<SosColor, number> = { DARK_RED: 0, RED: 0, ORANGE: 0, GREEN: 0 }
  for (const v of views) byColor[v.sos.color] += 1
  return {
    houses: views.reduce((n, v) => n + v.units, 0),
    sites: views.length,
    byColor,
    reports30: reports.filter(isActive).length,
    openReports: reports.filter((r) => r.status === 'OPEN').length,
  }
}

function zonesOf(reports: ReportRecord[]): ZoneSummary[] {
  const map = new Map<string, ZoneSummary>()
  for (const r of reports.filter(isActive)) {
    const z = map.get(r.zone.id) ?? { ...r.zone, reports: 0, open: 0, nearestDueAt: r.dueAt }
    z.reports += 1
    if (r.status === 'OPEN') z.open += 1
    if (r.dueAt < z.nearestDueAt) z.nearestDueAt = r.dueAt
    map.set(r.zone.id, z)
  }
  return [...map.values()].sort((a, b) => a.nearestDueAt.localeCompare(b.nearestDueAt))
}

// ───────── 읽기 ─────────

export function getSites(): SitesResponse {
  const { sites, reports } = db()
  const views = sites.map((s) => siteView(s, reports)).sort(compareSos)
  return { asOf: AS_OF, summary: summaryOf(views, reports), sites: views, zones: zonesOf(reports) }
}

export function getSiteDetail(id: string): SiteDetailResponse {
  const { sites, reports } = db()
  const s = findSite(id)
  return {
    site: siteView(s, reports),
    reports: reports
      .filter((r) => r.siteId === s.id)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((r) => reportView(r, sites)),
  }
}

/** 담당자용 목록: 아직 연결 안 한 제보(OPEN) 먼저, 그다음 연결된 제보. 각각 기한 가까운 순 */
export function getReports(): ReportsResponse {
  const { sites, reports } = db()
  const rank: Record<ReportState, number> = { OPEN: 0, LINKED: 1, UNREGISTERED: 2 }
  const sorted = [...reports].sort((a, b) => rank[a.status] - rank[b.status] || a.dueAt.localeCompare(b.dueAt) || a.id.localeCompare(b.id))
  return {
    asOf: AS_OF,
    reports: sorted.filter((r) => r.status !== 'UNREGISTERED').map((r) => reportView(r, sites)),
    unregistered: sorted.filter((r) => r.status === 'UNREGISTERED').map((r) => reportView(r, sites)),
  }
}

/** 안산시 대략 범위(대부도 포함). 바다·다른 시를 찍으면 400 */
const ANSAN_BOX = { latMin: 37.15, latMax: 37.42, lngMin: 126.45, lngMax: 126.95 }

function checkPoint(lat: number, lng: number) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw badRequest('위치(lat, lng)가 필요합니다', 'INVALID_LOCATION')
  if (lat < ANSAN_BOX.latMin || lat > ANSAN_BOX.latMax || lng < ANSAN_BOX.lngMin || lng > ANSAN_BOX.lngMax) {
    throw badRequest('안산시 안의 위치를 골라 주세요', 'OUT_OF_AREA')
  }
}

export function resolveZone(lat: number, lng: number): ZoneResolveResponse {
  checkPoint(lat, lng)
  const z = zoneFor(lat, lng, db().sites)
  return { zoneId: z.id, zoneLabel: z.label, bounds: z.bounds }
}

// ───────── 쓰기 ─────────

const CATEGORY_SET = new Set(REPORT_CATEGORIES.map((c) => c.value))

export interface NewReport {
  category: string
  title: string
  description: string
  photoCount: number
  lat: number
  lng: number
}

/** 시민 제보 등록. 좌표는 250m 격자로 바꿔 저장하고 원래 좌표는 버린다. 색은 바꾸지 않는다 */
export function createReport(input: NewReport): ReportReceiptResponse {
  if (!CATEGORY_SET.has(input.category as ReportCategory)) throw badRequest('카테고리를 골라 주세요', 'INVALID_CATEGORY')
  checkPoint(input.lat, input.lng)
  const store = db()
  const zone = zoneFor(input.lat, input.lng, store.sites)
  const r: ReportRecord = {
    id: `R-2026-${String(store.nextSeq++).padStart(4, '0')}`,
    category: input.category as ReportCategory,
    title: input.title.slice(0, 100) || `${categoryLabel(input.category as ReportCategory)} 제보`,
    description: input.description.slice(0, 1000),
    photoCount: Math.max(0, Math.min(3, input.photoCount)),
    zone,
    createdAt: AS_OF,
    dueAt: addDays(AS_OF, REPORT_DUE_DAYS),
    status: 'OPEN',
    siteId: null,
    inspectedAt: null,
  }
  store.reports.push(r)
  console.info(`[store] 제보 접수 ${r.id} · ${zone.label} (${zone.id})`)
  return { reportId: r.id, zoneLabel: zone.label, status: 'OPEN' }
}

/** 담당자가 제보를 빈집에 연결하거나 미등록 확인 요청으로 분류한다. 자동 연결은 하지 않는다 */
export function decideReport(id: string, decision: unknown, siteId: unknown): Report {
  const store = db()
  const r = store.reports.find((x) => x.id === id)
  if (!r) throw notFound(`제보 ${id}를 찾을 수 없습니다`, 'REPORT_NOT_FOUND')

  if (decision === 'LINK') {
    if (typeof siteId !== 'string' || !siteId) throw badRequest('연결할 빈집(siteId)이 필요합니다')
    if (r.status === 'LINKED') throw badRequest('이미 다른 빈집에 연결된 제보입니다', 'ALREADY_LINKED')
    const site = findSite(siteId)
    r.status = 'LINKED'
    r.siteId = site.id
    site.timeline.push({ date: AS_OF, type: '제보 연결', note: linkNote(r) })
  } else if (decision === 'UNREGISTERED') {
    if (r.status === 'LINKED') throw badRequest('이미 다른 빈집에 연결된 제보입니다', 'ALREADY_LINKED')
    r.status = 'UNREGISTERED'
  } else {
    throw badRequest("decision은 'LINK' 또는 'UNREGISTERED'입니다")
  }
  return reportView(r, store.sites)
}

/** 위해 단계 확정(null = 이상 없음). 연결된 제보는 현장조사 완료로 본다 */
export function confirmInspection(siteId: string, stage: unknown, journal: string): InspectionResponse {
  if (!(stage === null || stage === 1 || stage === 2 || stage === 3)) {
    throw badRequest('confirmedStage는 1, 2, 3 또는 null입니다', 'INVALID_STAGE')
  }
  const store = db()
  const s = findSite(siteId)
  s.hazardStage = stage
  s.lastChecked = AS_OF
  s.actionDone = false
  const text = journal.trim().slice(0, 500)
  s.timeline.push({
    date: AS_OF,
    type: '점검',
    note: stage ? `${stage}단계 위해 확정. ${text}`.trim() : `이상 없음. ${text}`.trim(),
  })
  for (const r of store.reports) {
    if (r.siteId === s.id && r.status === 'LINKED' && r.inspectedAt === null) r.inspectedAt = AS_OF
  }
  const view = siteView(s, store.reports)
  return { siteId: s.id, color: view.sos.color, actionRequired: stage !== null || s.cityPending, site: view }
}

/** 조치 완료: 초록, 주기 6개월, 다음 점검은 완료일 + 6개월 */
export function completeAction(siteId: string, note: string, photoCount: number): ActionResponse {
  const store = db()
  const s = findSite(siteId)
  s.actionDone = true
  s.hazardStage = null
  s.cityPending = false
  s.cycleMonths = 6
  s.lastChecked = AS_OF
  const text = note.trim().slice(0, 300) || '1차 안전조치 완료'
  s.timeline.push({ date: AS_OF, type: '조치 완료', note: photoCount > 0 ? `${text} (완료 사진 ${photoCount}장)` : text })
  const view = siteView(s, store.reports)
  return { siteId: s.id, color: view.sos.color, nextInspectionAt: view.sos.nextInspectionAt, site: view }
}

/** AI 판독용: 빈집이 있는지만 확인 */
export function assertSite(siteId: string): void {
  findSite(siteId)
}
