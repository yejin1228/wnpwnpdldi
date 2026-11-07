import type { Metadata } from 'next'
import { AdminDashboard } from '@/components/admin/admin-dashboard'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export const metadata: Metadata = {
  title: '시 담당자 대시보드 | VOIDA',
  robots: { index: false },
}

export default function AdminPage() {
  return (
    <main className="flex min-h-dvh bg-secondary/40 lg:h-dvh lg:overflow-hidden">
      <AdminSidebar />
      <AdminDashboard />
    </main>
  )
}
