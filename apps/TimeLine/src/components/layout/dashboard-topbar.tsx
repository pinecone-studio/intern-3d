'use client'

import Link from 'next/link'
import { useRole } from '@/lib/role-context'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Monitor, LogOut, Orbit } from 'lucide-react'

export function DashboardTopbar() {
  const { role, user, logout } = useRole()

  const now = new Date()
  const formattedDate = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`
  const formattedTime = new Intl.DateTimeFormat('mn-MN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now)

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted text-foreground">
              <Orbit className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-none text-foreground">
                Academic TimeLine
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Room availability
              </p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            {role === 'student' && user?.assignedDevice && (
              <Badge variant="outline" className="rounded-full px-3 py-1 text-xs font-medium">
                <Monitor className="mr-1.5 h-3.5 w-3.5" />
                Таны iMac: {user.assignedDevice.name}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs font-mono">
              {formattedTime}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {formattedDate}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ThemeToggle />
          <Badge 
            variant="outline"
            className={`rounded-md px-2 py-1 ${
              role === 'admin' 
                ? 'text-foreground' 
                : 'text-muted-foreground'
            }`}
          >
            {role === 'admin' ? 'Админ горим' : 'Сурагч горим'}
          </Badge>
          <Button asChild variant="ghost" size="sm" className="rounded-md">
            <Link href="/" onClick={logout} className="inline-flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              <span>Гарах</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
