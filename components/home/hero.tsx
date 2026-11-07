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
            안산시 빈집 안전관리
          </span>
          <h1 className="text-balance text-3xl font-bold leading-tight tracking-tight text-primary md:text-5xl">
            시민의 제보와 현장점검을 잇는
            <br />
            안산시 빈집 안전관리
          </h1>
          <p className="max-w-md text-pretty leading-relaxed text-muted-foreground">
            방치된 빈집의 위험을 시민이 제보하면, 시 담당자가 우선순위에 따라 현장을 점검하고 상태를 관리합니다.
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
