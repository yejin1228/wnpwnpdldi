import type { Metadata } from 'next'
import { ReportFlow } from '@/components/report/report-flow'

export const metadata: Metadata = {
  title: '빈집 제보 | 안산시 빈집 안전관리 플랫폼',
  description: '주변 빈집의 위험 요소를 사진과 함께 제보하세요.',
}

export default function ReportPage() {
  return (
    <main className="min-h-dvh bg-secondary/60">
      <ReportFlow />
    </main>
  )
}
