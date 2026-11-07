/**
 * SOS 긴급도 규칙 (docs/개발명세.md 3장).
 * 점수·가중치를 쓰지 않는다. 위해 판정과 점검 기한 중 더 나쁜 쪽을 색으로 쓴다.
 * AI는 색을 정하지 않는다. 색은 담당자가 확정한 결과로만 바뀐다.
 */

export type SosColor = 'DARK_RED' | 'RED' | 'ORANGE' | 'GREEN'
/** 점검에서 확정한 위해 단계. null = 이상 없음 또는 아직 점검 전 */
export type HazardStage = 1 | 2 | 3 | null

/** 기준일(서버·화면 공통 상수). 바꾸는 기능은 두지 않는다. */
export const AS_OF = '2026-11-08'

export interface SosInput {
  plan: string
  exposureCount: number
  cycleMonths: 6 | 12
  lastChecked: string
  hazardStage: HazardStage
  /** 시 정비방식이 안전조치·철거이고 아직 조치 전 */
  cityPending: boolean
  actionDone: boolean
  asOf?: string
}

export interface SosResult {
  color: SosColor
  /** 0 초록 · 1 주황 · 2 빨강 · 3 진한 빨강 */
  level: number
  nextInspectionAt: string
  overdueDays: number
  reasons: string[]
}

export const SOS_STYLE: Record<SosColor, { label: string; color: string; action: string }> = {
  DARK_RED: { label: '진한 빨강', color: '#7f1d1d', action: '조치' },
  RED: { label: '빨강', color: '#dc2626', action: '조치·상태 확인' },
  ORANGE: { label: '주황', color: '#f97316', action: '확인' },
  GREEN: { label: '초록', color: '#16a34a', action: '정상 관리' },
}

export const SOS_LEGEND: { color: SosColor; text: string }[] = [
  { color: 'DARK_RED', text: '1단계 위해(붕괴·화재·범죄) 확인, 조치 전' },
  { color: 'RED', text: '2단계 위해 확인 또는 시 안전조치·철거 대상, 조치 전' },
  { color: 'ORANGE', text: '3단계 위해 확인 또는 점검 기한 지남' },
  { color: 'GREEN', text: '기한 안 확인·이상 없음 또는 조치 완료' },
]

export const ZONE_COLOR = '#eab308'

export const STAGE_LABEL: Record<1 | 2 | 3, string> = {
  1: '1단계 · 붕괴·화재·범죄 우려',
  2: '2단계 · 위생상 유해',
  3: '3단계 · 경관·생활환경 훼손',
}

const COLORS: SosColor[] = ['GREEN', 'ORANGE', 'RED', 'DARK_RED']

function addMonths(date: string, months: number): string {
  const [y, m, d] = date.split('-').map(Number)
  const t = new Date(Date.UTC(y, m - 1 + months, d))
  return t.toISOString().slice(0, 10)
}

function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000)
}

export function calculateSos(i: SosInput): SosResult {
  const asOf = i.asOf ?? AS_OF
  const nextInspectionAt = addMonths(i.lastChecked, i.cycleMonths)
  const overdueDays = Math.max(0, daysBetween(nextInspectionAt, asOf))
  const reasons: string[] = []
  let level = 0

  if (!i.actionDone) {
    if (i.hazardStage === 1) {
      level = Math.max(level, 3)
      reasons.push('1단계 위해 확인(붕괴·화재·범죄 우려), 조치 전')
    }
    if (i.hazardStage === 2) {
      level = Math.max(level, 2)
      reasons.push('2단계 위해 확인(위생), 조치 전')
    }
    if (i.cityPending) {
      level = Math.max(level, 2)
      reasons.push(`시 정비방식 '${i.plan}' 대상, 조치 전`)
    }
    if (i.hazardStage === 3) {
      level = Math.max(level, 1)
      reasons.push('3단계 위해 확인(경관·생활환경), 조치 전')
    }
  }
  if (overdueDays > 0) {
    level = Math.max(level, 1)
    reasons.push(`점검 기한 ${overdueDays}일 지남 (주기 ${i.cycleMonths}개월)`)
  }
  if (level === 0) {
    reasons.push(i.actionDone ? `조치 완료 · 다음 점검 ${nextInspectionAt}` : `기한 안 · 다음 점검 ${nextInspectionAt}`)
  }

  return { color: COLORS[level], level, nextInspectionAt, overdueDays, reasons }
}

/** 정렬: 색이 나쁜 순 → 피해 범위 많은 순 → 기한 넘긴 일수 많은 순 → id */
export function compareSos(
  a: { id: string; exposureCount: number; sos: SosResult },
  b: { id: string; exposureCount: number; sos: SosResult },
): number {
  return (
    b.sos.level - a.sos.level ||
    b.exposureCount - a.exposureCount ||
    b.sos.overdueDays - a.sos.overdueDays ||
    a.id.localeCompare(b.id)
  )
}
