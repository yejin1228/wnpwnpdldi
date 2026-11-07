'use client'

import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { getBuildings } from '@/lib/api'
import { MOCK_REPORTS } from '@/lib/mock/data'
import { AS_OF, SOS_STYLE, compareSos } from '@/lib/sos'
import type { Building } from '@/lib/types'
import { BuildingPanel } from './building-panel'
import { MapToolbar, type MapFilters } from './map-toolbar'
import { SosLegend } from './sos-legend'
import { SummaryCards } from './summary-cards'

const PriorityMap = dynamic(() => import('./priority-map'), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse bg-muted" />,
})

const TODAY = new Date(AS_OF)

function applyFilters(buildings: Building[], f: MapFilters) {
  const q = f.query.trim()
  return buildings.filter((b) => {
    if (q && !b.address.includes(q) && !b.id.includes(q)) return false
    if (f.dong !== 'all' && b.dong !== f.dong) return false
    if (f.quick === 'urgent' && b.sos.level < 2) return false
    if (f.quick === 'reported' && b.reportCount === 0) return false
    if (f.quick === 'overdue' && b.sos.overdueDays === 0) return false
    if (f.period !== 'all') {
      const since = TODAY.getTime() - Number(f.period) * 86_400_000
      const hasRecent = MOCK_REPORTS.some((r) => r.buildingId === b.id && new Date(r.createdAt).getTime() >= since)
      if (!hasRecent) return false
    }
    return true
  })
}

function PriorityList({ buildings, onSelect }: { buildings: Building[]; onSelect: (id: string) => void }) {
  return (
    <div className="flex h-full flex-col">
      <header className="border-b px-5 py-4">
        <h2 className="font-semibold text-primary">먼저 갈 곳</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">색 → 피해 범위 → 기한 넘긴 일수 순. 지도나 목록에서 빈집을 고르세요.</p>
      </header>
      <ol className="flex-1 overflow-y-auto">
        {buildings.map((b, i) => (
          <li key={b.id}>
            <button
              type="button"
              onClick={() => onSelect(b.id)}
              className="flex w-full items-start gap-3 border-b px-5 py-3 text-left hover:bg-muted/60"
            >
              <span className="w-5 shrink-0 pt-0.5 text-xs tabular-nums text-muted-foreground">{i + 1}</span>
              <span
                className="mt-1 size-3 shrink-0 rounded-full"
                style={{ background: SOS_STYLE[b.sos.color].color }}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">{b.address}</span>
                  {b.reportCount > 0 && (
                    <span className="shrink-0 rounded-full bg-yellow-100 px-2 py-0.5 text-[11px] font-medium text-yellow-800">
                      제보 {b.reportCount}
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">{b.sos.reasons[0]}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function AdminDashboard() {
  const { data: buildings = [], mutate } = useSWR('buildings', getBuildings)
  const { mutate: globalMutate } = useSWRConfig()
  const [filters, setFilters] = useState<MapFilters>({ query: '', quick: 'all', dong: 'all', period: 'all' })
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const dongs = useMemo(() => [...new Set(buildings.map((b) => b.dong))].sort(), [buildings])
  const visible = useMemo(() => applyFilters(buildings, filters), [buildings, filters])
  const selected = buildings.find((b) => b.id === selectedId) ?? null

  const handleUpdated = (updated: Building) => {
    mutate((prev) => prev?.map((b) => (b.id === updated.id ? updated : b)).sort(compareSos), { revalidate: false })
    globalMutate('admin-summary')
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-16 items-center justify-between border-b bg-background px-5">
        <div>
          <h1 className="font-semibold text-primary">SOS 긴급도 지도</h1>
          <p className="text-xs text-muted-foreground">어디부터 가야 하는지 지도에서 확인하세요</p>
        </div>
        <span className="text-right text-xs text-muted-foreground">
          2026.11.08 기준 · 안산시 빈집정비계획(안) 158호
          <br />
          위치는 근사값 · 마지막 점검일은 2026.01.01로 가정
        </span>
      </header>

      <div className="flex flex-col gap-4 p-4 md:p-5">
        <SummaryCards />
        <MapToolbar filters={filters} dongs={dongs} onChange={(p) => setFilters((f) => ({ ...f, ...p }))} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 pb-4 md:px-5 md:pb-5 lg:flex-row">
        <div className="relative h-[60vh] min-h-96 flex-1 overflow-hidden rounded-xl border lg:h-auto">
          <PriorityMap buildings={visible} selectedId={selectedId} onSelect={setSelectedId} />
          <div className="absolute bottom-3 left-3 z-[400]">
            <SosLegend />
          </div>
          <span className="absolute right-3 top-3 z-[400] rounded-full bg-background/95 px-3 py-1 text-xs font-medium shadow-sm">
            표시 {visible.length}곳 / 전체 {buildings.length}곳
          </span>
        </div>

        <aside
          aria-label="빈집 상세"
          className="flex max-h-[calc(100vh-4rem)] min-h-96 flex-col overflow-hidden rounded-xl border bg-card lg:w-[400px] lg:shrink-0"
        >
          {selected ? (
            <BuildingPanel
              key={selected.id}
              building={selected}
              onClose={() => setSelectedId(null)}
              onUpdated={handleUpdated}
            />
          ) : (
            <PriorityList buildings={visible} onSelect={setSelectedId} />
          )}
        </aside>
      </div>
    </div>
  )
}
