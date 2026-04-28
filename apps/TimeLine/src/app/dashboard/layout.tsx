'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRole } from '@/lib/role-context'
import { DashboardTopbar } from '@/components/layout/dashboard-topbar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { role, loading } = useRole()

  useEffect(() => {
    if (!loading && !role) {
      router.replace('/')
    }
  }, [loading, role, router])

  if (loading || !role) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <DashboardTopbar />
      <main className="p-3 sm:p-5">
        <div className="mx-auto max-w-[1800px]">
          {children}
        </div>
      </main>
    </div>
  )
}
