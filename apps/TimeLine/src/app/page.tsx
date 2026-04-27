'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRole } from '@/lib/role-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, ShieldCheck, Clock, Monitor } from 'lucide-react'
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
        const data = (await response.json()) as UsersResponse
        if (!response.ok) {
          throw new Error('Хэрэглэгчдийн жагсаалтыг уншиж чадсангүй.')
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
        {/* Logo and Title */}
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

        {/* Role Selection */}
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
                  <Button
                    key={entry.id}
                    variant="outline"
                    className="h-auto w-full justify-start gap-4 p-4 hover:bg-primary/5 hover:border-primary/50 transition-all"
                    disabled={submittingUserId != null}
                    onClick={() => void handleUserSelect(entry)}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10">
                      <ShieldCheck className="h-6 w-6 text-blue-400" />
                    </div>
                    <div className="flex flex-col items-start text-left">
                      <span className="font-semibold text-foreground">{entry.name}</span>
                      <span className="text-sm text-muted-foreground">
                        Хуваарь удирдах, төхөөрөмж хянах
                      </span>
                    </div>
                  </Button>
                ))}

                {studentUsers.map((entry) => (
                  <Button
                    key={entry.id}
                    variant="outline"
                    className="h-auto w-full justify-start gap-4 p-4 hover:bg-primary/5 hover:border-primary/50 transition-all"
                    disabled={submittingUserId != null}
                    onClick={() => void handleUserSelect(entry)}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10">
                      <GraduationCap className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div className="flex flex-col items-start text-left">
                      <span className="font-semibold text-foreground">{entry.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {entry.assignedDevice
                          ? `Таны iMac: ${entry.assignedDevice.name} / Анги ${entry.assignedDevice.roomNumber}`
                          : 'Сул өрөө хайх, өөрийн iMac харах'}
                      </span>
                    </div>
                  </Button>
                ))}
              </>
            )}

            {loginError ? (
              <p className="text-sm text-destructive">{loginError}</p>
            ) : null}
          </CardContent>
        </Card>

        {/* Features Preview */}
        <div className="grid grid-cols-2 gap-3 pt-4">
          <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-card/30 p-3">
            <Monitor className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">10 лаборатори</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-card/30 p-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Шууд хуваарь</span>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground/60">
          Программ хангамжийн сургуулийн дотоод систем
        </p>
      </div>
    </div>
  )
}
