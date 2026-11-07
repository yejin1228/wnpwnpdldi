import Link from 'next/link'
import { BrandMark } from './brand-mark'

const NAV = [
  { href: '/#about', label: '서비스 소개' },
  { href: '/report', label: '시민 제보' },
  { href: '/admin', label: '담당자' },
  { href: '/patrol', label: '순찰대' },
  { href: '/#contact', label: '문의' },
]

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <BrandMark />
          <span className="text-sm font-semibold text-primary md:text-base">안산시 빈집 안전관리 플랫폼</span>
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
