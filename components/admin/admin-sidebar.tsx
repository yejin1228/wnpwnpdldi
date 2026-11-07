import Link from 'next/link'
import {
  BarChart3,
  Building2,
  ClipboardCheck,
  Map,
  MessageSquareText,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import { BrandMark } from '@/components/site/brand-mark'
import { cn } from '@/lib/utils'

const MENU: { label: string; icon: LucideIcon; active?: boolean }[] = [
  { label: 'SOS 긴급도 지도', icon: Map, active: true },
  { label: '시민 제보 목록', icon: MessageSquareText },
  { label: '현장점검 기록', icon: ClipboardCheck },
  { label: '건물 목록', icon: Building2 },
  { label: '통계·리포트', icon: BarChart3 },
  { label: '설정', icon: Settings },
]

export function AdminSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 flex-col bg-primary text-primary-foreground lg:flex">
      <Link href="/" className="flex h-16 items-center gap-2.5 border-b border-white/10 px-5">
        <BrandMark className="bg-brand" />
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">빈집 안전관리</span>
          <span className="text-xs text-primary-foreground/75">시 담당자</span>
        </span>
      </Link>
      <nav aria-label="담당자 메뉴" className="flex-1 px-3 py-4">
        <ul className="flex flex-col gap-1">
          {MENU.map((m) => (
            <li key={m.label}>
              <span
                aria-current={m.active ? 'page' : undefined}
                aria-disabled={!m.active}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm',
                  m.active ? 'bg-white/10 font-semibold' : 'cursor-not-allowed text-primary-foreground/55',
                )}
              >
                <m.icon className="size-4" aria-hidden="true" />
                <span className="flex-1">{m.label}</span>
                {!m.active && <span className="text-[11px] text-primary-foreground/60">준비 중</span>}
              </span>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t border-white/10 px-5 py-4 text-xs text-primary-foreground/70">
        담당: 홍길동 (단원구)
      </div>
    </aside>
  )
}
