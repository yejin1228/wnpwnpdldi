import Link from 'next/link'
import { CircleCheck } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { REPORT_STATUS_STEPS, categoryLabel } from '@/lib/labels'
import type { ReportReceipt } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ReportCompleteProps {
  receipt: ReportReceipt
  onReset: () => void
}

export function ReportComplete({ receipt, onReset }: ReportCompleteProps) {
  const currentIndex = REPORT_STATUS_STEPS.findIndex((s) => s.value === receipt.status)

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center gap-6 px-4 py-10">
        <span className="flex size-16 items-center justify-center rounded-full bg-accent text-brand">
          <CircleCheck className="size-9" aria-hidden="true" />
        </span>
        <div className="text-center">
          <h2 className="text-xl font-bold text-primary">제보가 접수되었습니다</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">소중한 제보 감사합니다.</p>
        </div>

        <dl className="w-full divide-y rounded-xl border bg-card text-sm">
          {[
            ['접수번호', receipt.receiptNo],
            ['카테고리', categoryLabel(receipt.category)],
            ['위치', receipt.zoneLabel],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between px-4 py-3">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        <section aria-labelledby="progress" className="w-full rounded-xl border bg-card p-4">
          <h3 id="progress" className="text-sm font-semibold">
            처리 상태
          </h3>
          <ol className="mt-4 flex items-center">
            {REPORT_STATUS_STEPS.map((s, i) => {
              const active = i <= currentIndex
              return (
                <li key={s.value} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <span
                      className={cn(
                        'flex size-7 items-center justify-center rounded-full text-xs font-semibold',
                        active ? 'bg-brand text-brand-foreground' : 'bg-muted text-muted-foreground',
                      )}
                      aria-current={i === currentIndex ? 'step' : undefined}
                    >
                      {i + 1}
                    </span>
                    <span className={cn('text-xs', active ? 'font-semibold text-primary' : 'text-muted-foreground')}>
                      {s.label}
                    </span>
                  </div>
                  {i < REPORT_STATUS_STEPS.length - 1 && (
                    <span aria-hidden="true" className="mx-1 mb-5 h-px flex-1 bg-border" />
                  )}
                </li>
              )
            })}
          </ol>
          <p className="mt-4 text-xs text-muted-foreground">처리 단계만 안내되며 건물 정보는 공개되지 않습니다.</p>
        </section>
      </div>

      <div className="sticky bottom-0 flex gap-2 border-t bg-background/95 p-4 backdrop-blur">
        <Button variant="outline" size="lg" className="h-12 flex-1" onClick={onReset}>
          추가 제보하기
        </Button>
        <Link href="/" className={cn(buttonVariants({ size: 'lg' }), 'h-12 flex-1')}>
          메인으로
        </Link>
      </div>
    </div>
  )
}
