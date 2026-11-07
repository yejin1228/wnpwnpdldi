import type { HazardStage, SosResult } from './sos'

export type ReportCategory =
  | 'collapse'
  | 'garbage'
  | 'intrusion'
  | 'fire'
  | 'pest'
  | 'etc'

export interface ZoneSelection {
  /** 시민에게 보여주는 구역 이름 (예: 단원구 고잔동 일대) */
  zoneLabel: string
  /** 담당자에게만 전달되는 좌표 */
  lat: number
  lng: number
}

export interface ReportDraft {
  category: ReportCategory | null
  title: string
  content: string
  photos: File[]
  zone: ZoneSelection | null
}

export interface ReportReceipt {
  receiptNo: string
  category: ReportCategory
  zoneLabel: string
  status: ReportStatus
}

export type ReportStatus = 'received' | 'reviewing' | 'inspecting' | 'done'

export interface AdminSummary {
  /** 계획대상 빈집 호수(158) */
  totalHouses: number
  /** 지도 방문지 수(130) */
  totalSites: number
  newReports: number
  /** 진한 빨강 + 빨강 */
  urgent: number
  /** 주황 */
  orange: number
  /** 초록 */
  green: number
}

export interface TimelineItem {
  date: string
  type: string
  note: string
}

/** 방문지 1곳 = data/houses.json 한 항목 + SOS 계산값 */
export interface Building {
  id: string
  /** 화면 표시용: '동 가린지번' (근사 위치) */
  address: string
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
  cycleMonths: 6 | 12
  lastChecked: string
  hazardStage: HazardStage
  cityPending: boolean
  actionDone: boolean
  sos: SosResult
  reportCount: number
  /** 연결된 제보 중 가장 최근 접수일 */
  latestReportAt: string | null
  /** 연결된 제보 중 현장조사 전인 것의 가장 가까운 기한 */
  openReportDueAt: string | null
  /** openReportDueAt까지 남은 일수(D-day 배지). 없으면 null */
  dDay: number | null
  timeline: TimelineItem[]
}

export interface CitizenReport {
  id: string
  /** 연결된 빈집 id. 아직 연결 전이면 '' */
  buildingId: string
  category: ReportCategory
  title: string
  description: string
  createdAt: string
  photoCount: number
  /** 접수일 + 30일 현장조사 기한 */
  dueAt: string
  dDay: number
  status: 'OPEN' | 'LINKED' | 'UNREGISTERED'
  zoneLabel: string
  inspectedAt: string | null
  /** 담당자 화면 전용: 구역 안 등록 빈집 */
  candidateIds: string[]
}

export interface AiReading {
  buildingId: string
  /** LIVE = 실제 AI 호출, CACHE = 저장된 응답(인터넷·키 문제 시) */
  source: 'LIVE' | 'CACHE'
  /** 보안·화재·위생·붕괴·경관 5개 항목 */
  findings: { key: string; label: string; status: 'DETECTED' | 'NOT_DETECTED' | 'UNKNOWN'; detail: string }[]
  /** 점검 일지 초안 */
  summary: string
  /** 관찰 결과로 뽑은 위해 단계 후보. 확정은 담당자 */
  suggestedStage: HazardStage
  recommendedAction: string | null
  readAt: string
}


export interface PatrolScreenshot {
  id: string
  title: string
  caption: string
  src: string | null
}
