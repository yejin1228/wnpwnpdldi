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
  timeline: TimelineItem[]
}

export interface CitizenReport {
  id: string
  buildingId: string
  category: ReportCategory
  title: string
  createdAt: string
  photoCount: number
}

export interface AiReading {
  buildingId: string
  /** 백엔드 AI 판독 결과 그대로 표시 */
  findings: { label: string; detail: string }[]
  summary: string
  readAt: string
}


export interface PatrolScreenshot {
  id: string
  title: string
  caption: string
  src: string | null
}
