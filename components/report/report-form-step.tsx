'use client'

import { ChevronRight, Info, MapPin, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PhotoPicker } from '@/components/shared/photo-picker'
import type { ReportDraft } from '@/lib/types'
import { CategoryPicker } from './category-picker'

interface ReportFormStepProps {
  draft: ReportDraft
  onChange: (patch: Partial<ReportDraft>) => void
  onNext: () => void
}

export function ReportFormStep({ draft, onChange, onNext }: ReportFormStepProps) {
  const canProceed = draft.category && draft.title.trim() && draft.content.trim()

  return (
    <form
      className="flex flex-1 flex-col"
      onSubmit={(e) => {
        e.preventDefault()
        if (canProceed) onNext()
      }}
    >
      <div className="flex flex-1 flex-col gap-6 px-4 py-5">
        <section aria-labelledby="guide" className="rounded-xl border border-brand/20 bg-accent/50 p-4">
          <h2 id="guide" className="flex items-center gap-1.5 text-sm font-semibold text-accent-foreground">
            <Info className="size-4" aria-hidden="true" />
            제보 안내
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            주변 빈집의 위험 요소를 알려주세요. 제보 내용은 시 담당자가 확인 후 현장점검에 반영합니다.
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-sm font-medium text-destructive">
            <Phone className="size-3.5" aria-hidden="true" />
            붕괴·화재 등 긴급 위험은 119로 신고하세요
          </p>
        </section>

        <fieldset className="flex flex-col gap-2.5">
          <legend className="mb-2.5 text-sm font-semibold">
            제보 카테고리 <span className="text-destructive">*</span>
          </legend>
          <CategoryPicker value={draft.category} onChange={(category) => onChange({ category })} />
        </fieldset>

        <div className="flex flex-col gap-2">
          <Label htmlFor="title" className="font-semibold">
            제목 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            className="h-11"
            placeholder="제목을 입력하세요"
            maxLength={50}
            value={draft.title}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="content" className="font-semibold">
            상세 내용 <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="content"
            className="min-h-28"
            placeholder="어떤 문제가 있는지 적어주세요"
            maxLength={1000}
            value={draft.content}
            onChange={(e) => onChange({ content: e.target.value })}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold">사진 첨부 (최대 3장)</span>
          <PhotoPicker files={draft.photos} onChange={(photos) => onChange({ photos })} />
          <p className="text-xs text-muted-foreground">얼굴·차량번호 등 개인정보가 찍히지 않도록 주의해 주세요.</p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold">
            위치 <span className="text-destructive">*</span>
          </span>
          <div className="flex items-center gap-3 rounded-xl border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            <MapPin className="size-4 text-brand" aria-hidden="true" />
            {draft.zone ? draft.zone.zoneLabel : '다음 단계에서 구역을 선택합니다'}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 border-t bg-background/95 p-4 backdrop-blur">
        <Button type="submit" size="lg" className="h-12 w-full text-base" disabled={!canProceed}>
          다음: 위치 선택
          <ChevronRight data-icon="inline-end" />
        </Button>
      </div>
    </form>
  )
}
