'use client'

import useSWR from 'swr'
import { getAdminSummary } from '@/lib/api'
import { cn } from '@/lib/utils'

interface Stat {
  label: string
  value: string
  unit?: string
  note?: string
  /** 숫자 색. 흰 배경에서 큰 글자 대비 3:1 이상이 되도록 SOS 색을 한 단계 진하게 쓴다. */
  numColor?: string
  highlight?: boolean
}

/**
 * 현황판 한 줄: 칸마다 카드를 따로 만들지 않고, 테두리 하나 안을 가는 선으로 나눈다.
 * SOS 칸은 장식 없이 숫자 자체를 그 색으로 칠한다.
 */
export function SummaryCards() {
  const { data } = useSWR('admin-summary', getAdminSummary, { refreshInterval: 5000 })
  const v = (n: number | undefined) => (n == null ? '–' : String(n))

  const stats: Stat[] = [
    {
      label: '관리 대상 빈집',
      value: v(data?.totalHouses),
      unit: '호',
      note: data ? `점검 장소 ${data.totalSites}곳` : undefined,
      highlight: true,
    },
    { label: '신규 시민 제보', value: v(data?.newReports), unit: '건', note: '30일 안 현장조사' },
    { label: '긴급 (진한 빨강)', value: v(data?.darkRed), unit: '곳', note: '1단계 위해 확인, 조치 전', numColor: '#7f1d1d' },
    { label: '긴급 (빨강)', value: v(data?.red), unit: '곳', note: '위해 확인·시 판정, 조치 전', numColor: '#dc2626' },
    { label: '확인 필요 (주황)', value: v(data?.orange), unit: '곳', note: '점검 기한 지남', numColor: '#c2410c' },
    { label: '정상 (초록)', value: v(data?.green), unit: '곳', note: '기한 안·조치 완료', numColor: '#15803d' },
  ]

  return (
    <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-3 xl:grid-cols-6">
      {stats.map((s) => (
        <li key={s.label} className={cn('min-w-0 px-4 py-3', s.highlight ? 'bg-primary text-primary-foreground' : 'bg-card')}>
          <span className={cn('block text-sm font-medium', s.highlight ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
            {s.label}
          </span>
          <p className="mt-1 flex items-baseline gap-1">
            <span className="text-4xl font-bold tabular-nums" style={s.numColor ? { color: s.numColor } : undefined}>
              {s.value}
            </span>
            {s.unit && s.value !== '–' && (
              <span className={cn('text-base', s.highlight ? 'text-primary-foreground/80' : 'text-muted-foreground')}>{s.unit}</span>
            )}
          </p>
          {s.note && (
            <p className={cn('mt-0.5 truncate text-xs', s.highlight ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
              {s.note}
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}
