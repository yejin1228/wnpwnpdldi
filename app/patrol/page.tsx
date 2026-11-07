import type { Metadata } from 'next'
import { PatrolGallery } from '@/components/patrol/patrol-gallery'
import { SiteFooter } from '@/components/site/site-footer'
import { SiteHeader } from '@/components/site/site-header'
import { getPatrolScreenshots } from '@/lib/api'

export const metadata: Metadata = {
  title: '순찰대 앱 | VOIDA',
}

export default async function PatrolPage() {
  const shots = await getPatrolScreenshots()

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 md:px-6 md:py-16">
        <h1 className="text-2xl font-bold tracking-tight text-primary md:text-3xl">순찰대 모바일 앱</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          순찰대원은 배정된 경로를 따라 빈집을 방문하고, 현장 점검 결과를 앱에서 바로 시 담당자에게 전송합니다.
        </p>
        <PatrolGallery shots={shots} />
      </main>
      <SiteFooter />
    </>
  )
}
