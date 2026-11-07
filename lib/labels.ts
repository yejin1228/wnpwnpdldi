import type { ReportCategory, ReportStatus } from './types'

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

export const EXPOSURE_LABEL = {
  facility: '학교·어린이집·경로당 100m 이내',
  cluster: '같은 지번·100m 안 다른 빈집',
  density: '주변 주택 밀집(100m 안 44동 이상)',
} as const
