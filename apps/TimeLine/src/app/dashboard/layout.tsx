'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRole } from '@/lib/role-context'
import { DashboardTopbar } from '@/components/layout/dashboard-topbar'
import { Button } from '@/components/ui/button'
import { PineconeLoader } from '@/components/ui/pinecone-loader'
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
  const [bootstrapping, setBootstrapping] = useState(false)
  const [bootstrapAttempted, setBootstrapAttempted] = useState(false)
  const [bootstrapError, setBootstrapError] = useState<string | null>(null)
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState('')

  const ensureAdminSession = useCallback(async () => {
    setBootstrapping(true)
    setBootstrapError(null)
    try {
      const response = await fetch('/api/users', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error('Users could not be loaded.')
      }

      const data = (await response.json().catch(() => ({ users: [] }))) as UsersResponse
      const users = data.users ?? []
      const adminUser = users.find((entry) => entry.role === 'admin')

      setAvailableUsers(users)
      setSelectedUserId(adminUser?.id ?? users[0]?.id ?? '')

      if (adminUser) {
        await loginAs(adminUser.id)
      } else {
        setBootstrapError('No admin user was found. Select a user to continue.')
      }
    } catch (error) {
      setBootstrapError(error instanceof Error ? error.message : 'Session setup failed.')
    } finally {
      setBootstrapAttempted(true)
      setBootstrapping(false)
    }
  }, [loginAs])

  useEffect(() => {
    if (loading || role || bootstrapping || bootstrapAttempted) return

    void ensureAdminSession()
  }, [bootstrapAttempted, bootstrapping, ensureAdminSession, loading, role])

  const retryBootstrap = () => {
    setBootstrapAttempted(false)
    setBootstrapError(null)
    void ensureAdminSession()
  }

  const loginSelectedUser = async () => {
    if (!selectedUserId) return

    try {
      setBootstrapping(true)
      setBootstrapError(null)
      await loginAs(selectedUserId)
    } catch (error) {
      setBootstrapError(error instanceof Error ? error.message : 'Login failed.')
    } finally {
      setBootstrapping(false)
    }
  }

  if (loading || bootstrapping) {
    return (
      <div className="flex h-screen items-center justify-center">
        <PineconeLoader />
      </div>
    )
  }

  if (!role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
        <div className="w-full max-w-sm rounded-md border border-border bg-background p-5 shadow-sm">
          <h1 className="text-lg font-semibold">Session required</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {bootstrapError ?? 'The dashboard could not start a session automatically.'}
          </p>
          {availableUsers.length > 0 ? (
            <div className="mt-4 space-y-3">
              <select
                value={selectedUserId}
                onChange={(event) => setSelectedUserId(event.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              >
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.role})
                  </option>
                ))}
              </select>
              <Button type="button" className="w-full" onClick={loginSelectedUser}>
                Continue
              </Button>
            </div>
          ) : (
            <Button type="button" className="mt-4 w-full" variant="outline" onClick={retryBootstrap}>
              Try again
            </Button>
          )}
        </div>
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
