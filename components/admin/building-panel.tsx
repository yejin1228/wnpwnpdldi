'use client'

import { useEffect, useRef, useState } from 'react'
import useSWR from 'swr'
import { Bot, CircleCheck, Hammer, LoaderCircle, MapPin, ShieldCheck, Upload, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { PhotoPicker } from '@/components/shared/photo-picker'
import { completeAction, confirmInspection, getAiReading, getBuildingReports, getReports, uploadInspectionPhotos } from '@/lib/api'
import { EXPOSURE_LABEL, categoryLabel } from '@/lib/labels'
import { SOS_STYLE, STAGE_LABEL, type HazardStage } from '@/lib/sos'
import type { AiReading, Building } from '@/lib/types'
import { cn } from '@/lib/utils'
import { DueBadge, ReportCard } from './report-list'

const STEPS = ['빈집·제보 확인', '현장 사진 업로드', 'AI 판독 결과', '위해 단계 확정·조치']

const STAGE_ITEMS = [
  { value: '1', label: STAGE_LABEL[1] },
  { value: '2', label: STAGE_LABEL[2] },
  { value: '3', label: STAGE_LABEL[3] },
  { value: 'none', label: '이상 없음' },
]

interface BuildingPanelProps {
  building: Building
  onClose: () => void
  onUpdated: (building: Building) => void
}

function Section({
  step,
  active,
  done,
  children,
  sectionRef,
}: {
  step: number
  active: boolean
  done: boolean
  children: React.ReactNode
  sectionRef?: React.Ref<HTMLElement>
}) {
  return (
    <section ref={sectionRef} aria-labelledby={`step-${step}`} className="scroll-mt-2 border-b px-5 py-5 last:border-b-0">
      <h3 id={`step-${step}`} className="flex items-center gap-2 text-base font-semibold">
        <span
          className={cn(
            'flex size-6 items-center justify-center rounded-full text-xs',
            done ? 'bg-brand text-brand-foreground' : active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
          )}
        >
          {done ? <CircleCheck className="size-3.5" aria-hidden="true" /> : step}
        </span>
        {STEPS[step - 1]}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function SosBadge({ building }: { building: Building }) {
  const s = SOS_STYLE[building.sos.color]
  return (
    <div className="rounded-lg p-3" style={{ background: s.color, color: s.ink }}>
      <p className="text-xs font-medium">SOS 긴급도</p>
      <p className="mt-0.5 text-xl font-bold">
        {s.label} · {s.action}
      </p>
      <ul className="mt-1.5 flex flex-col gap-0.5 text-sm">
        {building.sos.reasons.map((r) => (
          <li key={r}>· {r}</li>
        ))}
      </ul>
    </div>
  )
}

export function BuildingPanel({ building, onClose, onUpdated }: BuildingPanelProps) {
  const { data: reports, isLoading } = useSWR(['reports', building.id], () => getBuildingReports(building.id))
  // 이 빈집이 후보로 잡힌, 아직 연결 전인 시민 제보(담당자가 확인 후 연결)
  const { data: reportList } = useSWR('report-list', getReports, { refreshInterval: 5000 })
  const nearbyOpen = (reportList?.reports ?? []).filter((r) => r.status === 'OPEN' && r.candidateIds.includes(building.id))
  const byId = new Map([[building.id, building]])

  const [photos, setPhotos] = useState<File[]>([])
  const [uploadedCount, setUploadedCount] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [reading, setReading] = useState<AiReading | null>(null)
  const [readingLoading, setReadingLoading] = useState(false)
  const [stage, setStage] = useState<string>('none')
  const [journal, setJournal] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [acting, setActing] = useState(false)

  const currentStep = confirmed ? 5 : reading ? 4 : uploadedCount ? 3 : 2
  const needsAction = !building.actionDone && (building.hazardStage !== null || building.cityPending)
  const aiSectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    if (reading) aiSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [reading])

  const upload = async () => {
    setUploading(true)
    setUploadError(null)
    try {
      const { uploaded } = await uploadInspectionPhotos(building.id, photos)
      setUploadedCount(uploaded)
      setReadingLoading(true)
      const r = await getAiReading(building.id)
      setReading(r)
      setJournal(r.recommendedAction ? `${r.summary} 권고 조치: ${r.recommendedAction}.` : r.summary)
      setStage(r.suggestedStage ? String(r.suggestedStage) : 'none')
    } catch (e) {
      setUploadedCount(null)
      setUploadError(e instanceof Error ? e.message : 'AI 판독을 요청하지 못했습니다')
    } finally {
      setUploading(false)
      setReadingLoading(false)
    }
  }

  const confirm = async () => {
    setSaving(true)
    try {
      const s: HazardStage = stage === 'none' ? null : (Number(stage) as 1 | 2 | 3)
      onUpdated(await confirmInspection(building.id, s, journal))
      setConfirmed(true)
    } finally {
      setSaving(false)
    }
  }

  const act = async () => {
    setActing(true)
    try {
      onUpdated(await completeAction(building.id, '1차 안전조치(출입구 봉쇄) 완료'))
    } finally {
      setActing(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-start justify-between gap-3 border-b px-5 py-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {building.types.join('·')} · {building.units}호 · 시 등급 {building.grade} · {building.plan}
            {building.plan === '상시관리' ? '' : ` (시행 '${building.planYear})`}
          </p>
          <h2 className="mt-0.5 flex items-center gap-1.5 text-lg font-bold text-primary">
            <MapPin className="size-4 text-brand" aria-hidden="true" />
            {building.address}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-8 items-center justify-center rounded-lg hover:bg-muted"
          aria-label="패널 닫기 (Esc)"
        >
          <X className="size-4" />
        </button>
      </header>

      <ol aria-label="처리 단계" className="flex gap-1 border-b px-5 py-3">
        {STEPS.map((s, i) => (
          <li
            key={s}
            className={cn('h-1.5 flex-1 rounded-full', i + 1 < currentStep ? 'bg-brand' : i + 1 === currentStep ? 'bg-primary' : 'bg-muted')}
          >
            <span className="sr-only">
              {s} {i + 1 < currentStep ? '완료' : i + 1 === currentStep ? '진행 중' : '대기'}
            </span>
          </li>
        ))}
      </ol>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <Section step={1} active={false} done>
          <SosBadge building={building} />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground">다음 점검일</p>
              <p className="mt-1 text-base font-semibold tabular-nums">{building.sos.nextInspectionAt}</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground">점검 주기 · 최근 확인</p>
              <p className="mt-1 text-base font-semibold tabular-nums">
                {building.cycleMonths}개월 · {building.lastChecked}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-sm font-semibold text-muted-foreground">피해 범위 3개 중 {building.exposureCount}개</p>
            <ul className="mt-1.5 flex flex-wrap gap-1.5">
              {(Object.keys(EXPOSURE_LABEL) as (keyof typeof EXPOSURE_LABEL)[]).map((k) => (
                <li
                  key={k}
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-xs',
                    building.exposure[k] ? 'bg-primary/10 font-medium text-primary' : 'bg-muted text-muted-foreground line-through',
                  )}
                >
                  {EXPOSURE_LABEL[k]}
                </li>
              ))}
            </ul>
          </div>

          {nearbyOpen.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-violet-800">이 구역에 들어온 미연결 제보 {nearbyOpen.length}건</p>
              <ul className="mt-2 flex flex-col gap-2">
                {nearbyOpen.map((r) => (
                  <li key={r.id}>
                    <ReportCard report={r} byId={byId} onSelectBuilding={() => {}} onlyBuildingId={building.id} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4">
            <p className="text-sm font-semibold text-muted-foreground">연결된 시민 제보 {reports?.length ?? building.reportCount}건</p>
            {isLoading ? (
              <div className="mt-2 h-16 animate-pulse rounded-lg bg-muted" />
            ) : reports && reports.length > 0 ? (
              <ul className="mt-2 flex flex-col gap-2">
                {reports.map((r) => (
                  <li key={r.id} className="rounded-lg border border-violet-300 bg-violet-50 p-3 text-violet-950">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="secondary">{categoryLabel(r.category)}</Badge>
                      <DueBadge report={r} />
                    </div>
                    <p className="mt-1.5 text-base font-medium">{r.title}</p>
                    <p className="mt-1 text-xs text-violet-800">
                      {r.createdAt} 접수 · 기한 {r.dueAt} · 사진 {r.photoCount}장 · {r.id}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">접수된 제보가 없습니다.</p>
            )}
          </div>

          <div className="mt-4">
            <p className="text-sm font-semibold text-muted-foreground">기록</p>
            <ol className="mt-2 flex flex-col gap-1.5 border-l-2 pl-3">
              {building.timeline.map((t, i) => (
                <li key={`${t.date}-${i}`} className="text-sm">
                  <span className="font-medium">
                    {t.date} · {t.type}
                  </span>
                  <span className="block text-muted-foreground">{t.note}</span>
                </li>
              ))}
            </ol>
          </div>
        </Section>

        <Section step={2} active={currentStep === 2} done={uploadedCount !== null}>
          {uploadedCount !== null ? (
            <p className="text-sm text-muted-foreground">현장 사진 {uploadedCount}장 업로드 완료</p>
          ) : (
            <>
              <PhotoPicker files={photos} onChange={setPhotos} max={6} />
              {uploadError && (
                <p role="alert" className="mt-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {uploadError}
                </p>
              )}
              <Button className="mt-3 h-10 w-full" disabled={photos.length === 0 || uploading} onClick={upload}>
                {uploading ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : <Upload data-icon="inline-start" />}
                {uploading ? '업로드 중...' : '업로드 후 AI 판독 요청'}
              </Button>
            </>
          )}
        </Section>

        <Section step={3} active={currentStep === 3} done={reading !== null} sectionRef={aiSectionRef}>
          {readingLoading ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              AI가 사진을 판독하고 있습니다...
            </p>
          ) : reading ? (
            <div className="rounded-lg border border-brand/20 bg-accent/50 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-accent-foreground">
                  <Bot className="size-4" aria-hidden="true" />
                  AI 관찰 · 일지 초안
                </p>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                    reading.source === 'LIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900',
                  )}
                  title={reading.source === 'LIVE' ? '방금 AI가 판독한 결과' : '네트워크 문제로 저장된 판독 결과를 표시합니다'}
                >
                  {reading.source === 'LIVE' ? 'AI 판독' : '저장된 판독 결과'}
                </span>
              </div>
              <p className="mt-2 text-sm">{reading.summary}</p>
              <dl className="mt-3 flex flex-col gap-1.5 text-sm">
                {reading.findings.map((f) => (
                  <div key={f.key} className="flex gap-2">
                    <dt className="w-14 shrink-0 font-medium text-muted-foreground">{f.label}</dt>
                    <dd className={cn(f.status === 'DETECTED' && 'font-semibold', f.status === 'UNKNOWN' && 'text-muted-foreground')}>
                      {f.detail}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-sm">
                <span className="font-medium text-muted-foreground">단계 후보 </span>
                {reading.suggestedStage ? STAGE_LABEL[reading.suggestedStage] : '해당 없음'}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">AI 결과는 후보입니다. 위해 단계는 담당자가 확정합니다.</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">현장 사진을 업로드하면 판독 결과가 표시됩니다.</p>
          )}
        </Section>

        <Section step={4} active={currentStep >= 4} done={building.actionDone}>
          <div className="flex flex-col gap-3">
            {confirmed ? (
              <p className="text-sm text-muted-foreground">
                위해 단계를 확정했습니다. 결과와 다음 할 일은 아래에 있습니다.
              </p>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="stage-select">위해 단계 (빈집법 제11조)</Label>
                  <Select items={STAGE_ITEMS} value={stage} onValueChange={(v) => v && setStage(v)} disabled={!reading}>
                    <SelectTrigger id="stage-select" className="h-10 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGE_ITEMS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="journal">점검 일지</Label>
                  <Textarea
                    id="journal"
                    value={journal}
                    onChange={(e) => setJournal(e.target.value)}
                    disabled={!reading}
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>
        </Section>
      </div>

      <footer className="shrink-0 border-t bg-card px-5 py-3">
        {!confirmed && !reading && (
          <p className="text-sm text-muted-foreground">현장 사진을 올리면 AI 판독 뒤 위해 단계를 확정할 수 있습니다.</p>
        )}

        {!confirmed && reading && (
          <Button className="h-11 w-full text-base" disabled={saving} onClick={confirm}>
            {saving ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : <ShieldCheck data-icon="inline-start" />}
            {saving ? '저장 중...' : '위해 단계 확정'}
          </Button>
        )}

        {confirmed && (
          <div className="flex flex-col gap-2">
            <p
              className="flex items-center justify-between gap-3 rounded-lg px-3 py-2"
              style={{ background: SOS_STYLE[building.sos.color].color, color: SOS_STYLE[building.sos.color].ink }}
              aria-live="polite"
            >
              <span className="text-base font-bold">현재 긴급도: {SOS_STYLE[building.sos.color].label}</span>
              <span className="text-sm font-medium tabular-nums">다음 점검 {building.sos.nextInspectionAt}</span>
            </p>
            {needsAction && (
              <Button className="h-11 w-full text-base" variant="secondary" disabled={acting} onClick={act}>
                {acting ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : <Hammer data-icon="inline-start" />}
                {acting ? '저장 중...' : '조치 완료 (봉쇄 완료 사진 등록)'}
              </Button>
            )}
          </div>
        )}
      </footer>
    </div>
  )
}
