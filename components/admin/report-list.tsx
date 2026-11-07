'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Link2, LoaderCircle, MapPin, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getReports, linkReport, markReportUnregistered } from '@/lib/api'
import { categoryLabel, dDayLabel } from '@/lib/labels'
import { SOS_STYLE } from '@/lib/sos'
import type { Building, CitizenReport } from '@/lib/types'
import { cn } from '@/lib/utils'
import { useRefreshAdmin } from './use-refresh'

/** D-day 배지: 7일 이하면 진하게 */
export function DueBadge({ report }: { report: CitizenReport }) {
  if (report.inspectedAt) {
    return (
      <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
        현장조사 완료
      </span>
    )
  }
  const urgent = report.dDay <= 7
  return (
    <span
      className={cn(
        'shrink-0 rounded-full px-2 py-0.5 text-xs font-bold tabular-nums',
        urgent ? 'bg-violet-700 text-white' : 'bg-violet-100 text-violet-800',
      )}
      title={`현장조사 기한 ${report.dueAt} (접수일 + 30일)`}
    >
      {dDayLabel(report.dDay)}
    </span>
  )
}

function SiteChip({ b, onSelect }: { b: Building | undefined; onSelect: () => void }) {
  if (!b) return null
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex min-w-0 items-center gap-1.5 text-left text-sm font-medium hover:underline"
      title="지도에서 이 빈집 열기"
    >
      <span className="size-3 shrink-0 rounded-full" style={{ background: SOS_STYLE[b.sos.color].color }} aria-hidden="true" />
      <span className="truncate">{b.address}</span>
    </button>
  )
}

interface ReportCardProps {
  report: CitizenReport
  byId: Map<string, Building>
  onSelectBuilding: (id: string) => void
  /** 상세 패널 안에서 쓸 때: 이 빈집에만 연결 버튼을 보여 준다 */
  onlyBuildingId?: string
  onLinked?: (buildingId: string) => void
}

export function ReportCard({ report: r, byId, onSelectBuilding, onlyBuildingId, onLinked }: ReportCardProps) {
  const refresh = useRefreshAdmin()
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const run = async (key: string, fn: () => Promise<unknown>, after?: () => void) => {
    setBusy(key)
    setError(null)
    try {
      await fn()
      await refresh()
      after?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : '처리하지 못했습니다')
    } finally {
      setBusy(null)
    }
  }

  const candidates = onlyBuildingId ? r.candidateIds.filter((id) => id === onlyBuildingId) : r.candidateIds

  return (
    <article className="rounded-lg border border-violet-200 bg-violet-50/60 p-3 text-violet-950">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <Badge variant="secondary">{categoryLabel(r.category)}</Badge>
          {r.status === 'OPEN' && <span className="text-xs font-semibold text-violet-800">미연결</span>}
        </span>
        <DueBadge report={r} />
      </div>
      <p className="mt-1.5 text-base font-semibold">{r.title}</p>
      {r.description && <p className="mt-0.5 line-clamp-2 text-sm text-violet-900/80">{r.description}</p>}
      <p className="mt-1 flex items-center gap-1 text-xs text-violet-800">
        <MapPin className="size-3" aria-hidden="true" />
        {r.zoneLabel} 250m 구역 · {r.createdAt} 접수 · 사진 {r.photoCount}장 · {r.id}
      </p>

      {r.status === 'LINKED' && (
        <div className="mt-2 flex items-center gap-2 border-t border-violet-200 pt-2 text-sm">
          <Link2 className="size-3.5 shrink-0 text-violet-700" aria-hidden="true" />
          <span className="shrink-0 text-violet-800">연결:</span>
          <SiteChip b={byId.get(r.buildingId)} onSelect={() => onSelectBuilding(r.buildingId)} />
        </div>
      )}

      {r.status === 'OPEN' && (
        <div className="mt-2 flex flex-col gap-1.5 border-t border-violet-200 pt-2">
          {candidates.length > 0 ? (
            <>
              {!onlyBuildingId && <p className="text-xs font-semibold text-violet-800">이 구역의 등록 빈집</p>}
              {candidates.slice(0, 4).map((id) => (
                <div key={id} className="flex items-center justify-between gap-2">
                  {onlyBuildingId ? (
                    <span className="text-sm text-violet-900">이 빈집 구역에서 들어온 제보입니다</span>
                  ) : (
                    <SiteChip b={byId.get(id)} onSelect={() => onSelectBuilding(id)} />
                  )}
                  <Button
                    size="sm"
                    className="h-8 shrink-0 bg-violet-700 text-white hover:bg-violet-800"
                    disabled={busy !== null}
                    onClick={() => run(id, () => linkReport(r.id, id), () => onLinked?.(id))}
                  >
                    {busy === id ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : <Link2 data-icon="inline-start" />}
                    이 빈집에 연결
                  </Button>
                </div>
              ))}
            </>
          ) : (
            <p className="text-sm text-violet-900">구역 근처에 등록 빈집이 없습니다.</p>
          )}
          {!onlyBuildingId && (
            <button
              type="button"
              className="self-start text-xs font-medium text-violet-800 underline-offset-2 hover:underline disabled:opacity-50"
              disabled={busy !== null}
              onClick={() => run('unreg', () => markReportUnregistered(r.id))}
            >
              {busy === 'unreg' ? '처리 중…' : '미등록 건물로 분류 (별도 확인 요청)'}
            </button>
          )}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2 rounded bg-destructive/10 px-2 py-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </article>
  )
}

interface ReportListProps {
  buildings: Building[]
  focusZoneId: string | null
  onClearZone: () => void
  onSelectBuilding: (id: string) => void
}

/** 30일 제보 목록: 연결 전 제보 먼저, 그다음 기한 가까운 순(서버 정렬) */
export function ReportList({ buildings, focusZoneId, onClearZone, onSelectBuilding }: ReportListProps) {
  const { data, isLoading } = useSWR('report-list', getReports, { refreshInterval: 5000 })
  const byId = new Map(buildings.map((b) => [b.id, b]))
  const all = data?.reports ?? []
  const shown = focusZoneId ? all.filter((r) => r.zoneId === focusZoneId) : all
  const open = all.filter((r) => r.status === 'OPEN').length

  return (
    <div className="flex h-full flex-col">
      <header className="shrink-0 border-b px-5 py-3">
        <h2 className="text-lg font-bold text-primary">시민 제보</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          미연결 {open}건 · 현장조사 기한 순
        </p>
        {focusZoneId && (
          <button
            type="button"
            onClick={onClearZone}
            className="mt-2 flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-800 hover:bg-violet-200"
          >
            선택한 구역만 보는 중 ({shown[0]?.zoneLabel ?? '구역'}) <X className="size-3" aria-hidden="true" />
          </button>
        )}
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        {isLoading ? (
          <div className="h-24 animate-pulse rounded-lg bg-muted" />
        ) : shown.length === 0 ? (
          <p className="rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">30일 안에 들어온 제보가 없습니다.</p>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {shown.map((r) => (
              <li key={r.id}>
                <ReportCard report={r} byId={byId} onSelectBuilding={onSelectBuilding} onLinked={onSelectBuilding} />
              </li>
            ))}
          </ul>
        )}
        {!focusZoneId && data && data.unregistered.length > 0 && (
          <details className="mt-4 rounded-lg border p-3 text-sm">
            <summary className="cursor-pointer font-semibold">미등록 확인 요청 {data.unregistered.length}건</summary>
            <ul className="mt-2 flex flex-col gap-1.5">
              {data.unregistered.map((r) => (
                <li key={r.id} className="flex justify-between gap-2">
                  <span className="truncate">
                    {categoryLabel(r.category)} · {r.title}
                  </span>
                  <span className="shrink-0 text-muted-foreground">{r.zoneLabel}</span>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  )
}
