'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRole } from '@/lib/role-context'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/theme-toggle'
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
  const { user, loginAs } = useRole()
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

  const formattedDate = clockDisplay?.formattedDate ?? '--/--/----'
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
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#111827] text-white">
                <svg width="24" height="21" viewBox="0 0 32 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M5.11038 2.76848L0.806264 10.8246C0.269142 11.8328 0 12.9394 0 14.0474C0 15.1556 0.269142 16.2619 0.806264 17.2702L5.11038 25.3265C5.9037 26.8145 7.45516 27.7439 9.14352 27.7439H13.7153V25.4617H13.7138C12.8704 25.4617 12.0946 24.9977 11.6979 24.2538L7.39543 16.196C7.03585 15.5243 6.85665 14.7867 6.85665 14.0474C6.85665 13.3081 7.03585 12.5705 7.39543 11.899L11.6979 3.84121C12.0946 3.09711 12.8704 2.63325 13.7138 2.63325H13.7153V0.350922H9.14352C7.45516 0.350922 5.9037 1.28046 5.11038 2.76848Z" fill="currentColor" />
                  <path d="M31.1937 10.8247L26.8898 2.76854C26.0963 1.28036 24.545 0.350981 22.8567 0.350981H18.2847V2.63315H18.2864C19.1298 2.63315 19.9055 3.09717 20.3021 3.8411L24.6046 11.8989C24.9643 12.5705 25.1432 13.3082 25.1432 14.0475C25.1432 14.7867 24.9643 15.5244 24.6046 16.1961L20.3021 24.2537C19.9055 24.9977 19.1298 25.4616 18.2864 25.4616H18.2847V27.7439H22.8567C24.545 27.7439 26.0963 26.8146 26.8898 25.3264L31.1937 17.2703C31.7307 16.262 32 15.1555 32 14.0475C32 12.9394 31.7307 11.8329 31.1937 10.8247Z" fill="currentColor" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-none text-foreground">
                  Academic TimeLine
                </p>
              </div>
            </Link>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono">
              {formattedDate} {formattedTime}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {loadingUsers ? (
            <span className="text-xs text-muted-foreground">Loading...</span>
          ) : null}
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
