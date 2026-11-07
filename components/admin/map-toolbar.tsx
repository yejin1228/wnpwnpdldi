'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MOCK_DONGS } from '@/lib/mock/data'
import { cn } from '@/lib/utils'

export type QuickFilter = 'all' | 'reported' | 'pending'
export type PeriodFilter = 'all' | '7' | '30'

export interface MapFilters {
  query: string
  quick: QuickFilter
  dong: string
  period: PeriodFilter
}

const QUICK: { value: QuickFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'reported', label: '제보 있음' },
  { value: 'pending', label: '미점검' },
]

const DONG_ITEMS = [{ value: 'all', label: '전체 행정동' }, ...MOCK_DONGS.map((d) => ({ value: d.name, label: d.name }))]
const PERIOD_ITEMS = [
  { value: 'all', label: '전체 기간' },
  { value: '7', label: '최근 7일 제보' },
  { value: '30', label: '최근 30일 제보' },
]

interface MapToolbarProps {
  filters: MapFilters
  onChange: (patch: Partial<MapFilters>) => void
}

export function MapToolbar({ filters, onChange }: MapToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-full sm:w-64">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          aria-label="주소·건물 검색"
          placeholder="주소·건물 검색"
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
        <button
          type="button"
          disabled
          title="SOS 점수 구간 확정 후 제공"
          className="cursor-not-allowed rounded-md px-3 py-1.5 text-sm text-muted-foreground/50"
        >
          위험도 상
        </button>
      </div>
      <Select items={DONG_ITEMS} value={filters.dong} onValueChange={(v) => onChange({ dong: v ?? 'all' })}>
        <SelectTrigger aria-label="행정동" className="h-9 min-w-36 bg-card">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {DONG_ITEMS.map((d) => (
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
