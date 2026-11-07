'use client'

import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { MousePointerClick } from 'lucide-react'
import { getBuildings } from '@/lib/api'
import { MOCK_REPORTS } from '@/lib/mock/data'
import type { Building, StatusUpdateResult } from '@/lib/types'
import { BuildingPanel } from './building-panel'
import { MapToolbar, type MapFilters } from './map-toolbar'
import { SosLegend } from './sos-legend'
import { SummaryCards } from './summary-cards'

const PriorityMap = dynamic(() => import('./priority-map'), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse bg-muted" />,
})

const TODAY = new Date('2026-11-08')

function applyFilters(buildings: Building[], f: MapFilters) {
  const q = f.query.trim()
  return buildings.filter((b) => {
    if (q && !b.address.includes(q) && !b.id.includes(q)) return false
    if (f.dong !== 'all' && b.dong !== f.dong) return false
    if (f.quick === 'reported' && b.reportCount === 0) return false
    if (f.quick === 'pending' && b.inspectionStatus !== 'pending') return false
    if (f.period !== 'all') {
      const since = TODAY.getTime() - Number(f.period) * 86_400_000
      const hasRecent = MOCK_REPORTS.some((r) => r.buildingId === b.id && new Date(r.createdAt).getTime() >= since)
      if (!hasRecent) return false
    }
    return true
  })
}

export function AdminDashboard() {
  const { data: buildings = [], mutate } = useSWR('buildings', getBuildings)
  const [filters, setFilters] = useState<MapFilters>({ query: '', quick: 'all', dong: 'all', period: 'all' })
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const visible = useMemo(() => applyFilters(buildings, filters), [buildings, filters])
  const selected = buildings.find((b) => b.id === selectedId) ?? null

  const handleUpdated = (r: StatusUpdateResult) =>
    mutate(
      (prev) =>
        prev?.map((b) =>
          b.id === r.buildingId
            ? { ...b, sosScore: r.sosScore, inspectionStatus: r.inspectionStatus, lastInspectedAt: r.updatedAt.slice(0, 10) }
            : b,
        ),
      { revalidate: false },
    )

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-16 items-center justify-between border-b bg-background px-5">
        <div>
          <h1 className="font-semibold text-primary">SOS 긴급도 지도</h1>
          <p className="text-xs text-muted-foreground">우선순위 점검 대상을 지도에서 확인하세요</p>
        </div>
        <span className="text-xs text-muted-foreground">2026.11.08 기준 · 예시 데이터</span>
      </header>

      <div className="flex flex-col gap-4 p-4 md:p-5">
        <SummaryCards />
        <MapToolbar filters={filters} onChange={(p) => setFilters((f) => ({ ...f, ...p }))} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 pb-4 md:px-5 md:pb-5 lg:flex-row">
        <div className="relative h-[60vh] min-h-96 flex-1 overflow-hidden rounded-xl border lg:h-auto">
          <PriorityMap buildings={visible} selectedId={selectedId} onSelect={setSelectedId} />
          <div className="absolute bottom-3 left-3 z-[400]">
            <SosLegend />
          </div>
          <span className="absolute right-3 top-3 z-[400] rounded-full bg-background/95 px-3 py-1 text-xs font-medium shadow-sm">
            표시 {visible.length}개 / 전체 {buildings.length}개
          </span>
        </div>

        <aside
          aria-label="건물 상세"
          className="flex min-h-96 flex-col overflow-hidden rounded-xl border bg-card lg:w-[400px] lg:shrink-0"
        >
          {selected ? (
            <BuildingPanel
              key={selected.id}
              building={selected}
              onClose={() => setSelectedId(null)}
              onUpdated={handleUpdated}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-accent text-brand">
                <MousePointerClick className="size-6" aria-hidden="true" />
              </span>
              <p className="font-semibold text-primary">건물을 선택하세요</p>
              <p className="text-sm text-muted-foreground">
                지도에서 마커를 누르면 제보 내역 확인부터 현장점검, 상태 갱신까지 진행할 수 있습니다.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
