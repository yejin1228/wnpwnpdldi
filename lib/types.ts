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

export type InspectionStatus = 'pending' | 'scheduled' | 'inspected'

export interface AdminSummary {
  regularTargets: number
  newReports: number
  /** SOS 구간 확정 전에는 null */
  highRisk: number | null
  scheduledThisWeek: number
  completionRate: number
}

export interface Building {
  id: string
  address: string
  dong: string
  lat: number
  lng: number
  /** 백엔드가 계산해 내려주는 SOS 점수. 아직 산출 전이면 null */
  sosScore: number | null
  inspectionStatus: InspectionStatus
  lastInspectedAt: string | null
  reportCount: number
  builtYear: number
  structure: string
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

export interface StatusUpdateResult {
  buildingId: string
  sosScore: number | null
  inspectionStatus: InspectionStatus
  updatedAt: string
}

export interface PatrolScreenshot {
  id: string
  title: string
  caption: string
  src: string | null
}
