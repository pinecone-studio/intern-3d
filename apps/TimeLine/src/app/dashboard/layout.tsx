'use client'

import { useEffect } from 'react'
import { useRole } from '@/lib/role-context'
import { DashboardTopbar } from '@/components/layout/dashboard-topbar'
import type { User } from '@/lib/types'

type UsersResponse = {
  users: User[]
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { role, loading, loginAs } = useRole()

  useEffect(() => {
    if (loading || role) return

    let active = true

    const loginAsDefaultAdmin = async () => {
      try {
        const response = await fetch('/api/users', { cache: 'no-store' })
        const data = (await response.json().catch(() => ({ users: [] }))) as UsersResponse
        if (!response.ok || !active) return
        const adminUser = (data.users ?? []).find((entry) => entry.role === 'admin')
        if (!adminUser) return
        await loginAs(adminUser.id)
      } catch {
        // Keep loading UI if auto-login fails.
      }
    }

    void loginAsDefaultAdmin()
    return () => {
      active = false
    }
  }, [loading, loginAs, role])

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
