'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import { submitReport } from '@/lib/api'
import type { ReportDraft, ReportReceipt } from '@/lib/types'
import { LocationStep } from './location-step'
import { ReportComplete } from './report-complete'
import { ReportFormStep } from './report-form-step'

type Step = 'form' | 'location' | 'done'

const EMPTY_DRAFT: ReportDraft = { category: null, title: '', content: '', photos: [], zone: null }

const TITLES: Record<Step, string> = { form: '빈집 제보', location: '위치 선택', done: '제보 완료' }

export function ReportFlow() {
  const [step, setStep] = useState<Step>('form')
  const [draft, setDraft] = useState<ReportDraft>(EMPTY_DRAFT)
  const [receipt, setReceipt] = useState<ReportReceipt | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const patch = (p: Partial<ReportDraft>) => setDraft((d) => ({ ...d, ...p }))

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      setReceipt(await submitReport(draft))
      setStep('done')
    } catch {
      setError('제보를 제출하지 못했습니다. 잠시 후 다시 시도해 주세요.')
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setDraft(EMPTY_DRAFT)
    setReceipt(null)
    setStep('form')
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background md:my-6 md:min-h-[calc(100dvh-3rem)] md:overflow-hidden md:rounded-3xl md:border md:shadow-xl">
      <header className="sticky top-0 z-[500] flex h-14 items-center gap-2 border-b bg-background/95 px-2 backdrop-blur">
        {step === 'location' ? (
          <button
            type="button"
            onClick={() => setStep('form')}
            className="flex size-10 items-center justify-center rounded-lg hover:bg-muted"
            aria-label="이전 단계"
          >
            <ChevronLeft className="size-5" />
          </button>
        ) : (
          <Link href="/" className="flex size-10 items-center justify-center rounded-lg hover:bg-muted" aria-label="메인으로">
            <ChevronLeft className="size-5" />
          </Link>
        )}
        <h1 className="flex-1 font-semibold text-primary">{TITLES[step]}</h1>
        {step !== 'done' && (
          <span className="mr-2 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {step === 'form' ? '1' : '2'}/2
          </span>
        )}
      </header>

      {error && (
        <p role="alert" className="mx-4 mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {step === 'form' && <ReportFormStep draft={draft} onChange={patch} onNext={() => setStep('location')} />}
      {step === 'location' && (
        <LocationStep
          zone={draft.zone}
          onZoneChange={(zone) => patch({ zone })}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}
      {step === 'done' && receipt && <ReportComplete receipt={receipt} onReset={reset} />}
    </div>
  )
}
