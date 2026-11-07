'use client'

import useSWR from 'swr'
import { AlertTriangle, CalendarCheck, Gauge, House, MessageSquareText, type LucideIcon } from 'lucide-react'
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

  const stats: Stat[] = [
    { label: '정기점검 관리 대상', value: data ? String(data.regularTargets) : '–', unit: '호', icon: House, highlight: true },
    { label: '신규 시민 제보', value: data ? String(data.newReports) : '–', unit: '건', icon: MessageSquareText },
    {
      label: '고위험(긴급)',
      value: data?.highRisk != null ? String(data.highRisk) : '–',
      note: data?.highRisk == null ? 'SOS 구간 확정 후 집계' : undefined,
      icon: AlertTriangle,
    },
    { label: '이번 주 점검 예정', value: data ? String(data.scheduledThisWeek) : '–', unit: '건', icon: CalendarCheck },
    { label: '점검 완료율', value: data ? String(data.completionRate) : '–', unit: '%', icon: Gauge },
  ]

  return (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {stats.map((s) => (
        <li
          key={s.label}
          className={
            s.highlight
              ? 'rounded-xl bg-primary p-4 text-primary-foreground'
              : 'rounded-xl border bg-card p-4'
          }
        >
          <div className="flex items-center justify-between">
            <span className={s.highlight ? 'text-xs text-primary-foreground/70' : 'text-xs text-muted-foreground'}>
              {s.label}
            </span>
            <s.icon className={s.highlight ? 'size-4 text-primary-foreground/60' : 'size-4 text-brand'} aria-hidden="true" />
          </div>
          <p className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold tabular-nums">{s.value}</span>
            {s.unit && s.value !== '–' && (
              <span className={s.highlight ? 'text-sm text-primary-foreground/70' : 'text-sm text-muted-foreground'}>
                {s.unit}
              </span>
            )}
          </p>
          {s.note && <p className="mt-1 text-[11px] text-muted-foreground">{s.note}</p>}
        </li>
      ))}
    </ul>
  )
}
