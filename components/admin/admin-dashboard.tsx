'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'
import useSWR from 'swr'
import { getBuildings, getZones } from '@/lib/api'
import { dDayLabel } from '@/lib/labels'
import { AS_OF, SOS_STYLE, compareSos } from '@/lib/sos'
import type { Building } from '@/lib/types'
import { cn } from '@/lib/utils'
import { BuildingPanel } from './building-panel'
import { MapToolbar, type MapFilters } from './map-toolbar'
import { ReportList } from './report-list'
import { SosLegend } from './sos-legend'
import { SummaryCards } from './summary-cards'
import { useRefreshAdmin } from './use-refresh'

type ListTab = 'priority' | 'reports'

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
      if (!b.latestReportAt || new Date(b.latestReportAt).getTime() < since) return false
    }
    return true
  })
}

function PriorityList({ buildings, onSelect }: { buildings: Building[]; onSelect: (id: string) => void }) {
  return (
    <div className="flex h-full flex-col">
      <header className="shrink-0 border-b px-5 py-3">
        <h2 className="text-lg font-bold text-primary">먼저 갈 곳</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">긴급도가 높은 순서입니다.</p>
      </header>
      <ol className="min-h-0 flex-1 overflow-y-auto">
        {buildings.map((b, i) => (
          <li key={b.id}>
            <button
              type="button"
              onClick={() => onSelect(b.id)}
              aria-label={`${i + 1}위 ${b.address}, ${SOS_STYLE[b.sos.color].label}, ${b.sos.reasons[0]}${b.reportCount > 0 ? `, 시민 제보 ${b.reportCount}건` : ''}`}
              className="flex w-full items-start gap-3 border-b px-5 py-3 text-left hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none"
            >
              <span className="w-6 shrink-0 pt-0.5 text-sm tabular-nums text-muted-foreground">{i + 1}</span>
              <span
                className="mt-1 size-3.5 shrink-0 rounded-full"
                style={{ background: SOS_STYLE[b.sos.color].color }}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-base font-semibold">{b.address}</span>
                  <span className="flex shrink-0 gap-1">
                    {b.dDay != null && (
                      <span className="rounded-full bg-violet-700 px-2 py-0.5 text-xs font-bold text-white tabular-nums">
                        {dDayLabel(b.dDay)}
                      </span>
                    )}
                    {b.reportCount > 0 && (
                      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-800">
                        제보 {b.reportCount}
                      </span>
                    )}
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-sm text-muted-foreground">{b.sos.reasons[0]}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}

function ListTabs({ tab, onChange, openReports }: { tab: ListTab; onChange: (t: ListTab) => void; openReports: number }) {
  const item = (t: ListTab, label: React.ReactNode) => (
    <button
      type="button"
      role="tab"
      aria-selected={tab === t}
      onClick={() => onChange(t)}
      className={cn(
        'flex flex-1 items-center justify-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-semibold',
        tab === t ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground',
      )}
    >
      {label}
    </button>
  )
  return (
    <div role="tablist" aria-label="목록" className="flex shrink-0 border-b">
      {item('priority', '먼저 갈 곳')}
      {item(
        'reports',
        <>
          시민 제보
          {openReports > 0 && (
            <span className="rounded-full bg-violet-700 px-1.5 py-0.5 text-[11px] leading-none text-white">미연결 {openReports}</span>
          )}
        </>,
      )}
    </div>
  )
}

export function AdminDashboard() {
  const { data: buildings = [], mutate } = useSWR('buildings', getBuildings)
  // 다른 탭(시민 화면)에서 들어온 제보가 바로 보이도록 5초마다 다시 받는다
  const { data: zones = [] } = useSWR('zones', getZones, { refreshInterval: 5000 })
  const refreshAll = useRefreshAdmin()
  const [filters, setFilters] = useState<MapFilters>({ query: '', quick: 'all', dong: 'all', period: 'all' })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [listTab, setListTab] = useState<ListTab>('priority')
  const [focusZoneId, setFocusZoneId] = useState<string | null>(null)
  const openReports = zones.reduce((n, z) => n + z.open, 0)

  // 사이드바 '시민 제보 목록'(#reports) · 'SOS 긴급도 지도'(#map)
  useEffect(() => {
    const apply = () => {
      if (window.location.hash === '#reports') {
        setSelectedId(null)
        setListTab('reports')
      } else if (window.location.hash === '#map') {
        setSelectedId(null)
        setListTab('priority')
      }
    }
    apply()
    window.addEventListener('hashchange', apply)
    return () => window.removeEventListener('hashchange', apply)
  }, [])

  const selectZone = (zoneId: string) => {
    setSelectedId(null)
    setListTab('reports')
    setFocusZoneId(zoneId)
  }

  const dongs = useMemo(() => [...new Set(buildings.map((b) => b.dong))].sort(), [buildings])
  const visible = useMemo(() => applyFilters(buildings, filters), [buildings, filters])
  const selected = buildings.find((b) => b.id === selectedId) ?? null

  const handleUpdated = (updated: Building) => {
    mutate((prev) => prev?.map((b) => (b.id === updated.id ? updated : b)).sort(compareSos), { revalidate: false })
    // 점검하면 연결된 제보가 '현장조사 완료'로 바뀌므로 KPI·제보 목록도 다시 받는다
    void refreshAll()
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-5">
        <h1 className="text-xl font-bold text-primary">SOS 긴급도 지도</h1>
        <span className="text-right text-sm text-muted-foreground">2026.11.08 기준 · 안산시 빈집정비계획(안) 158호</span>
      </header>

      <div className="flex shrink-0 flex-col gap-3 p-4">
        <SummaryCards />
        <MapToolbar filters={filters} dongs={dongs} onChange={(p) => setFilters((f) => ({ ...f, ...p }))} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 pb-4 lg:flex-row">
        <div className="relative h-[60vh] min-h-96 flex-1 overflow-hidden rounded-xl border lg:h-auto lg:min-h-0">
          <PriorityMap
            buildings={visible}
            selectedId={selectedId}
            onSelect={setSelectedId}
            zones={zones}
            focusZoneId={focusZoneId}
            onZoneSelect={selectZone}
          />
          <div className="absolute bottom-3 left-3 z-[400]">
            <SosLegend />
          </div>
          <span className="absolute right-3 top-3 z-[400] rounded-full bg-background/95 px-3 py-1 text-sm font-semibold shadow-sm">
            표시 {visible.length}곳 / 전체 {buildings.length}곳
          </span>
        </div>

        <aside
          aria-label="빈집 상세"
          className="flex min-h-96 flex-col overflow-hidden rounded-xl border bg-card lg:min-h-0 lg:w-[420px] lg:shrink-0"
        >
          {selected ? (
            <BuildingPanel
              key={selected.id}
              building={selected}
              onClose={() => setSelectedId(null)}
              onUpdated={handleUpdated}
            />
          ) : (
            <>
              <ListTabs tab={listTab} onChange={setListTab} openReports={openReports} />
              <div className="min-h-0 flex-1">
                {listTab === 'priority' ? (
                  <PriorityList buildings={visible} onSelect={setSelectedId} />
                ) : (
                  <ReportList
                    buildings={buildings}
                    focusZoneId={focusZoneId}
                    onClearZone={() => setFocusZoneId(null)}
                    onSelectBuilding={setSelectedId}
                  />
                )}
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  )
}
