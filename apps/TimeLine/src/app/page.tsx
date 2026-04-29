'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRole } from '@/lib/role-context'
import { LoginSummaryCards } from '@/app/_components/login-summary-cards'
import { LoginUserOption } from '@/app/_components/login-user-option'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-react'
import type { User } from '@/lib/types'

type UsersResponse = {
  users: User[]
}

export default function LoginPage() {
  const router = useRouter()
  const { user, loading: sessionLoading, loginAs } = useRole()
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [submittingUserId, setSubmittingUserId] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionLoading && user) {
      router.replace('/dashboard')
    }
  }, [sessionLoading, router, user])

  useEffect(() => {
    let active = true

    const loadUsers = async () => {
      setLoadingUsers(true)
      setLoginError(null)

      try {
        const response = await fetch('/api/users', { cache: 'no-store' })
        const data = (await response.json().catch(() => ({ users: [] }))) as UsersResponse & {
          error?: string
        }
        if (!response.ok) {
          throw new Error(data.error ?? 'Хэрэглэгчдийн жагсаалтыг уншиж чадсангүй.')
        }

        if (active) {
          setUsers(data.users ?? [])
        }
      } catch (error) {
        if (active) {
          setLoginError(error instanceof Error ? error.message : 'Хэрэглэгчдийн жагсаалт ачаалсангүй.')
        }
      } finally {
        if (active) {
          setLoadingUsers(false)
        }
      }
    }

    void loadUsers()

    return () => {
      active = false
    }
  }, [])

  const adminUsers = useMemo(() => users.filter((entry) => entry.role === 'admin'), [users])
  const studentUsers = useMemo(() => users.filter((entry) => entry.role === 'student'), [users])

  const handleUserSelect = async (selectedUser: User) => {
    setLoginError(null)
    setSubmittingUserId(selectedUser.id)

    try {
      await loginAs(selectedUser.id)
      router.replace('/dashboard')
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Нэвтрэх үед алдаа гарлаа.')
    } finally {
      setSubmittingUserId(null)
    }
  }

  const isBusy = sessionLoading || loadingUsers

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
            <Clock className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Academic TimeLine
            </h1>
            <p className="text-muted-foreground">
              Өрөө болон төхөөрөмжийн удирдлагын систем
            </p>
          </div>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg">Нэвтрэх</CardTitle>
            <CardDescription>DB дээрх хэрэглэгчээ сонгоно уу</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isBusy ? (
              <div className="rounded-md border border-dashed border-border bg-background/60 p-6 text-center text-sm text-muted-foreground">
                Хэрэглэгчдийн мэдээллийг ачаалж байна...
              </div>
            ) : (
              <>
                {adminUsers.map((entry) => (
                  <LoginUserOption key={entry.id} disabled={submittingUserId != null} user={entry} onSelect={handleUserSelect} />
                ))}
                {studentUsers.map((entry) => (
                  <LoginUserOption key={entry.id} disabled={submittingUserId != null} user={entry} onSelect={handleUserSelect} />
                ))}
              </>
            )}

            {loginError ? (
              <p className="text-sm text-destructive">{loginError}</p>
            ) : null}
          </CardContent>
        </Card>

        <LoginSummaryCards />

        <p className="text-center text-xs text-muted-foreground/60">
          Программ хангамжийн сургуулийн дотоод систем
        </p>
      </div>
    </div>
  )
}
