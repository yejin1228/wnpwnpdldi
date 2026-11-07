import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Hero() {
  return (
    <section id="about">
      {/* 노트북(lg)에서는 아래 서비스 카드와 함께 한 화면에 들어가도록 위아래 여백을 줄인다. 화면이 높으면 조금 늘린다 */}
      <div className="mx-auto flex max-w-6xl items-center px-4 py-12 md:px-6 lg:py-6 lg:[@media(min-height:820px)]:py-12 lg:[@media(max-height:700px)]:py-3">
        <div className="flex max-w-2xl flex-col gap-5 lg:gap-4 lg:[@media(max-height:700px)]:gap-3">
          <span className="w-fit rounded-full border border-brand/20 bg-background px-3 py-1 text-xs font-medium text-brand">
            VOIDA · 안산시 빈집 관리
          </span>
          <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight text-primary md:text-5xl lg:[@media(max-height:700px)]:text-[2.5rem]">
            보이지 않던 빈집이,
            <br />
            이제 보이다
          </h1>
          <p className="max-w-xl text-pretty leading-relaxed text-muted-foreground">
            안산시 빈집정비계획(안)의 관리 대상 빈집을 긴급도 순으로 보여 줍니다. 시민 제보는 30일 안 현장조사로, 현장
            점검은 조치 기록으로 이어집니다.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/report" className={cn(buttonVariants({ size: 'lg' }), 'h-11 px-5')}>
              빈집 제보하기
              <ArrowRight data-icon="inline-end" />
            </Link>
            <Link href="#services" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-11 bg-background px-5')}>
              서비스 알아보기
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
