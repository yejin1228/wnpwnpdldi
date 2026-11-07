import Link from 'next/link'
import { ArrowRight, MapPinned, Megaphone, ShieldCheck, type LucideIcon } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ServiceCard {
  href: string
  title: string
  description: string
  cta: string
  meta: string
  icon: LucideIcon
}

const SERVICES: ServiceCard[] = [
  {
    href: '/report',
    title: '시민 제보',
    description: '주변 빈집의 위험 요소를 사진과 함께 간편하게 제보하세요.',
    cta: '제보하러 가기',
    meta: '모바일 최적화',
    icon: Megaphone,
  },
  {
    href: '/admin',
    title: '시 담당자',
    description: 'SOS 긴급도 지도로 우선순위를 확인하고 현장점검 결과를 관리합니다.',
    cta: '대시보드 열기',
    meta: '담당자 전용',
    icon: MapPinned,
  },
  {
    href: '/patrol',
    title: '순찰대',
    description: '순찰 경로 확인부터 현장 점검, 결과 전송까지 순찰대원이 쓰는 모바일 앱입니다.',
    cta: '앱 화면 보기',
    meta: '순찰대원 전용',
    icon: ShieldCheck,
  },
]

export function ServiceCards() {
  return (
    // 노트북(lg)에서는 첫 화면과 함께 한 화면에 들어가도록 여백과 카드 높이를 줄인다(아이콘·제목을 한 줄로)
    <section id="services" className="mx-auto max-w-6xl px-4 pb-12 md:px-6 lg:pb-6 lg:[@media(min-height:820px)]:pb-12 lg:[@media(max-height:700px)]:pb-3">
      <h2 className="text-2xl font-bold tracking-tight text-primary md:text-3xl lg:text-2xl">이용하실 서비스를 선택하세요</h2>
      <ul className="mt-5 grid gap-4 md:grid-cols-3 lg:mt-4 lg:[@media(max-height:700px)]:mt-3">
        {SERVICES.map((s) => (
          <li key={s.href}>
            <article className="group flex h-full flex-col rounded-2xl border bg-card p-5 transition-shadow hover:shadow-md lg:[@media(max-height:700px)]:p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-brand">
                  <s.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="text-lg font-semibold text-primary">{s.title}</h3>
                <span className="ml-auto text-xs text-muted-foreground">{s.meta}</span>
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{s.description}</p>
              <Link
                href={s.href}
                className={cn(buttonVariants({ variant: 'default' }), 'mt-4 h-10 w-full')}
              >
                {s.cta}
                <ArrowRight data-icon="inline-end" />
              </Link>
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}
