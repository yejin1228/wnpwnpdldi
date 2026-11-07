import type { Metadata } from 'next'
import { Info } from 'lucide-react'
import { PatrolGallery } from '@/components/patrol/patrol-gallery'
import { SiteFooter } from '@/components/site/site-footer'
import { SiteHeader } from '@/components/site/site-header'
import { getPatrolScreenshots } from '@/lib/api'

export const metadata: Metadata = {
  title: '순찰대 시연 화면 | 안산시 빈집 안전관리 플랫폼',
}

export default async function PatrolPage() {
  const shots = await getPatrolScreenshots()

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <span className="rounded-full border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">시연용</span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-primary md:text-3xl">순찰대 앱 시연 화면</h1>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Info className="size-4" aria-hidden="true" />
          실제 순찰 기능은 제공하지 않으며, 예시 화면만 확인할 수 있습니다.
        </p>
        <PatrolGallery shots={shots} />
      </main>
      <SiteFooter />
    </>
  )
}
