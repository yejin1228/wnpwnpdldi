/**
 * 서버 API 응답 형식(docs/개발명세.md 5·6장).
 * 서버(app/api, lib/server)와 화면 데이터 계층(lib/api)이 같이 쓴다.
 *
 * 명세와 다른 점(앱에 맞춤):
 * - 제보 카테고리는 화면 코드값(collapse·garbage…)을 그대로 쓴다.
 * - 사진은 저장하지 않고 장수(photoCount)만 남긴다.
 * - 점검·조치 응답에 갱신된 빈집(site)을 같이 넣는다.
 */
import type { Bounds } from './grid'
import type { HazardStage, SosColor, SosResult } from './sos'
import type { ReportCategory } from './types'

export type TimelineType = '실태조사' | '제보 연결' | '점검' | '조치 완료'

export interface TimelineEntry {
  date: string
  type: TimelineType
  note: string
}

/** 방문지 1곳 = houses.json 한 항목 + 계산값 */
export interface Site {
  id: string
  dong: string
  jibun: string
  /** 근사 위치 */
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
  cycleMonths: 6 | 12
  lastChecked: string
  hazardStage: HazardStage
  cityPending: boolean
  actionDone: boolean
  sos: SosResult
  /** 이 빈집에 연결된 제보 수 */
  reportCount: number
  /** 연결된 제보 중 가장 최근 접수일 */
  latestReportAt: string | null
  /** 연결된 제보 중 현장조사 전인 것의 가장 가까운 기한 */
  openReportDueAt: string | null
  /** openReportDueAt까지 남은 일수. 없으면 null */
  dDay: number | null
  timeline: TimelineEntry[]
}

export interface Zone {
  id: string
  /** 예: "선부동 일대" */
  label: string
  bounds: Bounds
}

/** 지도에 그리는 시민 제보 구역(30일 안 제보가 있는 격자) */
export interface ZoneSummary extends Zone {
  reports: number
  /** 아직 빈집에 연결하지 않은 제보 수 */
  open: number
  nearestDueAt: string
}

export type ReportState = 'OPEN' | 'LINKED' | 'UNREGISTERED'

export interface Report {
  id: string
  category: ReportCategory
  title: string
  description: string
  photoCount: number
  zone: Zone
  createdAt: string
  /** createdAt + 30일 (빈집법 시행령 제10조의3 현장조사 기한) */
  dueAt: string
  /** dueAt까지 남은 일수(지나면 음수) */
  dDay: number
  status: ReportState
  siteId: string | null
  /** 연결한 빈집을 현장 점검한 날. 그 전이면 null */
  inspectedAt: string | null
  /** 구역 안(없으면 바로 옆 8칸) 등록 빈집. 담당자 응답에만 넣는다 */
  candidateSiteIds: string[]
}

export interface Summary {
  houses: number
  sites: number
  byColor: Record<SosColor, number>
  /** 30일 기한 안 제보 수 */
  reports30: number
  /** 아직 빈집에 연결하지 않은 제보 수 */
  openReports: number
}

export interface SitesResponse {
  asOf: string
  summary: Summary
  sites: Site[]
  zones: ZoneSummary[]
}

export interface SiteDetailResponse {
  site: Site
  reports: Report[]
}

export interface ReportsResponse {
  asOf: string
  /** OPEN 먼저, 그다음 LINKED. 각각 기한 가까운 순 */
  reports: Report[]
  unregistered: Report[]
}

/** 시민에게 돌려주는 접수 결과. 후보 빈집은 넣지 않는다 */
export interface ReportReceiptResponse {
  reportId: string
  zoneLabel: string
  status: 'OPEN'
}

export interface ZoneResolveResponse {
  zoneId: string
  zoneLabel: string
  bounds: Bounds
}

export type ObsKey = 'security' | 'fire' | 'hygiene' | 'collapse' | 'landscape'
export type ObsStatus = 'DETECTED' | 'NOT_DETECTED' | 'UNKNOWN'

export interface AnalysisResult {
  source: 'LIVE' | 'CACHE'
  provider: 'gemini' | 'openai' | 'cache'
  observations: Record<ObsKey, { status: ObsStatus; evidence: string }>
  /** 관찰 결과에서 규칙으로 뽑은 후보. 확정은 담당자가 한다 */
  suggestedStage: 1 | 2 | 3 | null
  draftJournal: string
  recommendedAction: string | null
}

export interface InspectionResponse {
  siteId: string
  color: SosColor
  actionRequired: boolean
  site: Site
}

export interface ActionResponse {
  siteId: string
  color: SosColor
  nextInspectionAt: string
  site: Site
}

export interface ApiErrorBody {
  error: { code: string; message: string }
}
