'use client'

import useSWR from 'swr'
import { AlertTriangle, CircleCheck, Clock, House, MessageSquareText, type LucideIcon } from 'lucide-react'
import { getAdminSummary } from '@/lib/api'

interface Stat {
  label: string
  value: string
  unit?: string
  note?: string
  icon: LucideIcon
  highlight?: boolean
}

export function SummaryCards() {
  const { data } = useSWR('admin-summary', getAdminSummary)
  const v = (n: number | undefined) => (n == null ? '–' : String(n))

  const stats: Stat[] = [
    {
      label: '관리 대상 빈집',
      value: v(data?.totalHouses),
      unit: '호',
      note: data ? `방문지 ${data.totalSites}곳` : undefined,
      icon: House,
      highlight: true,
    },
    { label: '신규 시민 제보', value: v(data?.newReports), unit: '건', note: '30일 안 현장조사', icon: MessageSquareText },
    { label: '긴급 (빨강 이상)', value: v(data?.urgent), unit: '곳', note: '위해 확인·시 판정, 조치 전', icon: AlertTriangle },
    { label: '확인 필요 (주황)', value: v(data?.orange), unit: '곳', note: '점검 기한 지남', icon: Clock },
    { label: '정상 (초록)', value: v(data?.green), unit: '곳', note: '기한 안·조치 완료', icon: CircleCheck },
  ]

  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {stats.map((s) => (
        <li
          key={s.label}
          className={s.highlight ? 'rounded-xl bg-primary p-4 text-primary-foreground' : 'rounded-xl border bg-card p-4'}
        >
          <div className="flex items-center justify-between gap-2">
            <span className={s.highlight ? 'text-sm font-medium text-primary-foreground/80' : 'text-sm font-medium text-muted-foreground'}>
              {s.label}
            </span>
            <s.icon className={s.highlight ? 'size-4 text-primary-foreground/70' : 'size-4 text-brand'} aria-hidden="true" />
          </div>
          <p className="mt-1 flex items-baseline gap-1">
            <span className="text-4xl font-bold tabular-nums">{s.value}</span>
            {s.unit && s.value !== '–' && (
              <span className={s.highlight ? 'text-base text-primary-foreground/80' : 'text-base text-muted-foreground'}>
                {s.unit}
              </span>
            )}
          </p>
          {s.note && (
            <p className={s.highlight ? 'mt-0.5 text-xs text-primary-foreground/80' : 'mt-0.5 text-xs text-muted-foreground'}>
              {s.note}
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}
