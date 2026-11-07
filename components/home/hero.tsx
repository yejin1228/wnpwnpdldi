import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function Hero() {
  return (
    <section id="about" className="border-b bg-gradient-to-b from-accent/60 to-background">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-2 md:px-6 md:py-20">
        <div className="flex flex-col gap-6">
          <span className="w-fit rounded-full border border-brand/20 bg-background px-3 py-1 text-xs font-medium text-brand">
            VOIDA · 안산시 빈집 관리
          </span>
          <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight text-primary md:text-5xl">
            보이지 않던 빈집이,
            <br />
            이제 보이다
          </h1>
          <p className="max-w-md text-pretty leading-relaxed text-muted-foreground">
            안산시 빈집정비계획(안)의 관리 대상 빈집을 긴급도 순으로 보여 줍니다. 시민 제보는 30일 안 현장조사로, 현장
            점검은 조치 기록으로 이어집니다.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/report" className={cn(buttonVariants({ size: 'lg' }), 'h-11 px-5')}>
              빈집 제보하기
              <ArrowRight data-icon="inline-end" />
            </Link>
            <Link href="#services" className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'h-11 px-5')}>
              서비스 알아보기
            </Link>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border bg-muted shadow-sm">
          <Image
            src="/images/hero-ansan.png"
            alt="안산시 저층 주택가 골목 전경"
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  )
}
