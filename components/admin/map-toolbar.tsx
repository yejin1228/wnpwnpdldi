'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

export type QuickFilter = 'all' | 'urgent' | 'reported' | 'overdue'
export type PeriodFilter = 'all' | '7' | '30'

export interface MapFilters {
  query: string
  quick: QuickFilter
  dong: string
  period: PeriodFilter
}

const QUICK: { value: QuickFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'urgent', label: '긴급' },
  { value: 'reported', label: '제보 있음' },
  { value: 'overdue', label: '기한 지남' },
]

const PERIOD_ITEMS = [
  { value: 'all', label: '전체 기간' },
  { value: '7', label: '최근 7일 제보' },
  { value: '30', label: '최근 30일 제보' },
]

interface MapToolbarProps {
  filters: MapFilters
  dongs: string[]
  onChange: (patch: Partial<MapFilters>) => void
}

export function MapToolbar({ filters, dongs, onChange }: MapToolbarProps) {
  const dongItems = [{ value: 'all', label: '전체 법정동' }, ...dongs.map((d) => ({ value: d, label: d }))]

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-full sm:w-64">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          aria-label="동·지번 검색"
          placeholder="동·지번 검색 (예: 선부동)"
          className="h-9 bg-card pl-9"
          value={filters.query}
          onChange={(e) => onChange({ query: e.target.value })}
        />
      </div>
      <div role="group" aria-label="빠른 필터" className="flex rounded-lg border bg-card p-0.5">
        {QUICK.map((q) => (
          <button
            key={q.value}
            type="button"
            aria-pressed={filters.quick === q.value}
            onClick={() => onChange({ quick: q.value })}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm transition-colors',
              filters.quick === q.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {q.label}
          </button>
        ))}
      </div>
      <Select items={dongItems} value={filters.dong} onValueChange={(v) => onChange({ dong: v ?? 'all' })}>
        <SelectTrigger aria-label="법정동" className="h-9 min-w-36 bg-card">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {dongItems.map((d) => (
            <SelectItem key={d.value} value={d.value}>
              {d.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        items={PERIOD_ITEMS}
        value={filters.period}
        onValueChange={(v) => onChange({ period: (v ?? 'all') as PeriodFilter })}
      >
        <SelectTrigger aria-label="기간" className="h-9 min-w-32 bg-card">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PERIOD_ITEMS.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
