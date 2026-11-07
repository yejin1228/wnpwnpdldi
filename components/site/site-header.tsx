import Link from 'next/link'
import { BrandMark } from './brand-mark'

const NAV = [
  { href: '/#about', label: '서비스 소개' },
  { href: '/report', label: '시민 제보' },
  { href: '/admin', label: '담당자' },
  { href: '/patrol', label: '순찰대' },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <BrandMark />
          <span className="flex items-baseline gap-2">
            <span className="text-base font-bold tracking-tight text-primary md:text-lg">VOIDA</span>
            <span className="hidden text-xs text-muted-foreground sm:inline">안산시 빈집 관리</span>
          </span>
        </Link>
        <nav aria-label="주요 메뉴" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className="rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}
