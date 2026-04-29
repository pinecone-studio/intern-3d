'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRole } from '@/lib/role-context'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
import { Monitor, Orbit } from 'lucide-react'
import type { User } from '@/lib/types'

type UsersResponse = {
  users: User[]
}

type ClockDisplay = {
  formattedDate: string
  formattedTime: string
}

const createClockDisplay = (date: Date): ClockDisplay => ({
  formattedDate: `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`,
  formattedTime: new Intl.DateTimeFormat('mn-MN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date),
})

export function DashboardTopbar() {
  const { role, user, loginAs } = useRole()
  const [clockDisplay, setClockDisplay] = useState<ClockDisplay | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [switchingUserId, setSwitchingUserId] = useState<string | null>(null)

  useEffect(() => {
    setClockDisplay(createClockDisplay(new Date()))
    const intervalId = window.setInterval(() => {
      setClockDisplay(createClockDisplay(new Date()))
    }, 60000)

    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    let active = true

    const loadUsers = async () => {
      setLoadingUsers(true)
      try {
        const response = await fetch('/api/users', { cache: 'no-store' })
        const data = (await response.json().catch(() => ({ users: [] }))) as UsersResponse
        if (!active) return
        setUsers(response.ok ? (data.users ?? []) : [])
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

  
  const formattedTime = clockDisplay?.formattedTime ?? '--:--'

  const handleSwitchUser = async (userId: string) => {
    if (!userId || userId === user?.id) return
    setSwitchingUserId(userId)
    try {
      await loginAs(userId)
    } finally {
      setSwitchingUserId(null)
    }
  }

  const userOptions = useMemo(
    () => users.map((entry) => ({ id: entry.id, label: `${entry.name} (${entry.role === 'admin' ? 'Админ' : 'Сурагч'})` })),
    [users],
  )

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background">
      <div className="mx-auto flex max-w-[1800px] flex-col gap-3 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted text-foreground">
                <Orbit className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-none text-foreground">
                  Academic TimeLine
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Academy room scheduler
                </p>
              </div>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {role === 'student' && user?.assignedDevice && (
              <Badge variant="outline" className="rounded-full px-3 py-1 text-xs font-medium">
                <Monitor className="mr-1.5 h-3.5 w-3.5" />
                Таны iMac: {user.assignedDevice.name}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs font-mono">
              {formattedDate} {formattedTime}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
            value={user?.id ?? ''}
            onChange={event => void handleSwitchUser(event.target.value)}
            disabled={loadingUsers || switchingUserId != null}
            aria-label="Хэрэглэгч сонгох"
          >
            <option value="" disabled>
              {loadingUsers ? 'Хэрэглэгчид ачаалж байна...' : 'Хэрэглэгч сонгох'}
            </option>
            {userOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
