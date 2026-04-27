'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRole } from '@/lib/role-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, ShieldCheck, Clock, Monitor } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { isReady, role, setRole } = useRole()

  useEffect(() => {
    if (isReady && role) {
      router.replace('/dashboard')
    }
  }, [isReady, role, router])

  const handleRoleSelect = (role: 'admin' | 'student') => {
    setRole(role)
    router.push('/dashboard')
  }

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

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
            <CardDescription>Үүрэг сонгоно уу</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="h-auto w-full justify-start gap-4 p-4 hover:bg-primary/5 hover:border-primary/50 transition-all"
              onClick={() => handleRoleSelect('admin')}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20">
                <ShieldCheck className="h-6 w-6 text-blue-400" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="font-semibold text-foreground">Админ</span>
                <span className="text-sm text-muted-foreground">
                  Хуваарь удирдах, төхөөрөмж хянах
                </span>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto w-full justify-start gap-4 p-4 hover:bg-primary/5 hover:border-primary/50 transition-all"
              onClick={() => handleRoleSelect('student')}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <GraduationCap className="h-6 w-6 text-emerald-400" />
              </div>
              <div className="flex flex-col items-start text-left">
                <span className="font-semibold text-foreground">Сурагч</span>
                <span className="text-sm text-muted-foreground">
                  Сул өрөө хайх, өөрийн iMac харах
                </span>
              </div>
            </Button>
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
