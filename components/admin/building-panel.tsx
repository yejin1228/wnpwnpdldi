'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Bot, CircleCheck, LoaderCircle, MapPin, RefreshCw, Upload, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PhotoPicker } from '@/components/shared/photo-picker'
import { getAiReading, getBuildingReports, updateBuildingStatus, uploadInspectionPhotos } from '@/lib/api'
import { INSPECTION_STATUS_LABEL, categoryLabel } from '@/lib/labels'
import type { AiReading, Building, InspectionStatus, StatusUpdateResult } from '@/lib/types'
import { cn } from '@/lib/utils'

const STEPS = ['건물·제보 확인', '현장 사진 업로드', 'AI 판독 결과', '점수·상태 갱신']

const STATUS_ITEMS = (Object.keys(INSPECTION_STATUS_LABEL) as InspectionStatus[]).map((v) => ({
  value: v,
  label: INSPECTION_STATUS_LABEL[v],
}))

interface BuildingPanelProps {
  building: Building
  onClose: () => void
  onUpdated: (result: StatusUpdateResult) => void
}

function Section({ step, active, done, children }: { step: number; active: boolean; done: boolean; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`step-${step}`} className="border-b px-5 py-5 last:border-b-0">
      <h3 id={`step-${step}`} className="flex items-center gap-2 text-sm font-semibold">
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

export function BuildingPanel({ building, onClose, onUpdated }: BuildingPanelProps) {
  const { data: reports, isLoading } = useSWR(['reports', building.id], () => getBuildingReports(building.id))

  const [photos, setPhotos] = useState<File[]>([])
  const [uploadedCount, setUploadedCount] = useState<number | null>(null)
  const [uploading, setUploading] = useState(false)
  const [reading, setReading] = useState<AiReading | null>(null)
  const [readingLoading, setReadingLoading] = useState(false)
  const [status, setStatus] = useState<InspectionStatus>(building.inspectionStatus)
  const [updating, setUpdating] = useState(false)
  const [result, setResult] = useState<StatusUpdateResult | null>(null)

  const currentStep = result ? 5 : reading ? 4 : uploadedCount ? 3 : 2

  const upload = async () => {
    setUploading(true)
    try {
      const { uploaded } = await uploadInspectionPhotos(building.id, photos)
      setUploadedCount(uploaded)
      setReadingLoading(true)
      setReading(await getAiReading(building.id))
    } finally {
      setUploading(false)
      setReadingLoading(false)
    }
  }

  const update = async () => {
    setUpdating(true)
    try {
      const r = await updateBuildingStatus(building.id, status)
      setResult(r)
      onUpdated(r)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-start justify-between gap-3 border-b px-5 py-4">
        <div>
          <p className="text-xs text-muted-foreground">{building.id}</p>
          <h2 className="mt-0.5 flex items-center gap-1.5 font-semibold text-primary">
            <MapPin className="size-4 text-brand" aria-hidden="true" />
            {building.address}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex size-8 items-center justify-center rounded-lg hover:bg-muted"
          aria-label="패널 닫기"
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

      <div className="flex-1 overflow-y-auto">
        <Section step={1} active={false} done>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-primary p-3 text-primary-foreground">
              <p className="text-[11px] text-primary-foreground/70">SOS 점수</p>
              <p className="mt-0.5 text-xl font-bold tabular-nums">{building.sosScore ?? '–'}</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-[11px] text-muted-foreground">점검 상태</p>
              <p className="mt-1 text-sm font-semibold">{INSPECTION_STATUS_LABEL[building.inspectionStatus]}</p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-[11px] text-muted-foreground">최근 점검</p>
              <p className="mt-1 text-sm font-semibold">{building.lastInspectedAt ?? '없음'}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {building.builtYear}년 준공 · {building.structure}
          </p>

          <div className="mt-4">
            <p className="text-xs font-semibold text-muted-foreground">시민 제보 {reports?.length ?? building.reportCount}건</p>
            {isLoading ? (
              <div className="mt-2 h-16 animate-pulse rounded-lg bg-muted" />
            ) : reports && reports.length > 0 ? (
              <ul className="mt-2 flex flex-col gap-2">
                {reports.map((r) => (
                  <li key={r.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="secondary">{categoryLabel(r.category)}</Badge>
                      <span className="text-[11px] text-muted-foreground">{r.createdAt}</span>
                    </div>
                    <p className="mt-1.5 text-sm">{r.title}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {r.id} · 사진 {r.photoCount}장
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">접수된 제보가 없습니다.</p>
            )}
          </div>
        </Section>

        <Section step={2} active={currentStep === 2} done={uploadedCount !== null}>
          {uploadedCount !== null ? (
            <p className="text-sm text-muted-foreground">현장 사진 {uploadedCount}장 업로드 완료</p>
          ) : (
            <>
              <PhotoPicker files={photos} onChange={setPhotos} max={6} />
              <Button className="mt-3 h-10 w-full" disabled={photos.length === 0 || uploading} onClick={upload}>
                {uploading ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : <Upload data-icon="inline-start" />}
                {uploading ? '업로드 중...' : '업로드 후 AI 판독 요청'}
              </Button>
            </>
          )}
        </Section>

        <Section step={3} active={currentStep === 3} done={reading !== null}>
          {readingLoading ? (
            <p className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
              <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
              백엔드에서 AI 판독 중입니다...
            </p>
          ) : reading ? (
            <div className="rounded-lg border border-brand/20 bg-accent/50 p-3">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-accent-foreground">
                <Bot className="size-4" aria-hidden="true" />
                {reading.summary}
              </p>
              <dl className="mt-3 flex flex-col gap-1.5 text-sm">
                {reading.findings.map((f) => (
                  <div key={f.label} className="flex gap-2">
                    <dt className="w-14 shrink-0 font-medium text-muted-foreground">{f.label}</dt>
                    <dd>{f.detail}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-[11px] text-muted-foreground">판독 결과는 참고용이며 담당자가 최종 확인합니다.</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">현장 사진을 업로드하면 판독 결과가 표시됩니다.</p>
          )}
        </Section>

        <Section step={4} active={currentStep === 4} done={result !== null}>
          {result ? (
            <div className="rounded-lg bg-primary p-4 text-primary-foreground" aria-live="polite">
              <p className="text-xs text-primary-foreground/70">갱신된 SOS 점수 (백엔드 산출)</p>
              <p className="mt-1 text-3xl font-bold tabular-nums">{result.sosScore ?? '–'}</p>
              <p className="mt-2 text-sm">상태: {INSPECTION_STATUS_LABEL[result.inspectionStatus]}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="status-select">점검 상태</Label>
                <Select
                  items={STATUS_ITEMS}
                  value={status}
                  onValueChange={(v) => v && setStatus(v as InspectionStatus)}
                  disabled={!reading}
                >
                  <SelectTrigger id="status-select" className="h-10 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_ITEMS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="h-10 w-full" disabled={!reading || updating} onClick={update}>
                {updating ? <LoaderCircle className="animate-spin" data-icon="inline-start" /> : <RefreshCw data-icon="inline-start" />}
                {updating ? '갱신 요청 중...' : '상태 저장 및 점수 갱신 요청'}
              </Button>
              <p className="text-[11px] text-muted-foreground">SOS 점수는 백엔드에서 재산출되어 반영됩니다.</p>
            </div>
          )}
        </Section>
      </div>
    </div>
  )
}
