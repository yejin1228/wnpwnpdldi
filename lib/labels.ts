import type { InspectionStatus, ReportCategory, ReportStatus } from './types'

export const REPORT_CATEGORIES: { value: ReportCategory; label: string }[] = [
  { value: 'collapse', label: '붕괴 위험' },
  { value: 'garbage', label: '쓰레기 방치' },
  { value: 'intrusion', label: '무단 침입' },
  { value: 'fire', label: '화재 위험' },
  { value: 'pest', label: '해충·악취' },
  { value: 'etc', label: '기타' },
]

export const categoryLabel = (c: ReportCategory) =>
  REPORT_CATEGORIES.find((x) => x.value === c)?.label ?? c

export const REPORT_STATUS_STEPS: { value: ReportStatus; label: string }[] = [
  { value: 'received', label: '접수' },
  { value: 'reviewing', label: '검토' },
  { value: 'inspecting', label: '점검' },
  { value: 'done', label: '완료' },
]

export const INSPECTION_STATUS_LABEL: Record<InspectionStatus, string> = {
  pending: '미점검',
  scheduled: '점검 예정',
  inspected: '점검 완료',
}
