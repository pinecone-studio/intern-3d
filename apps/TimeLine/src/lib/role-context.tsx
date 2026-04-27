'use client'

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User, UserRole } from './types'

type RoleContextType = {
  user: User | null
  role: UserRole | null
  loading: boolean
  loginAs: (_userId: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

type SessionResponse = {
  user: User | null
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/session', {
        cache: 'no-store',
      })
      const data = (await response.json()) as SessionResponse
      setUser(data.user ?? null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshUser()
  }, [refreshUser])

  const loginAs = useCallback(async (userId: string) => {
    setLoading(true)

    try {
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      })

      const data = (await response.json()) as SessionResponse & { error?: string }
      if (!response.ok || !data.user) {
        throw new Error(data.error ?? 'Нэвтрэх үед алдаа гарлаа.')
      }

      setUser(data.user)
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setLoading(true)

    try {
      await fetch('/api/session', {
        method: 'DELETE',
      })
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <RoleContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        loading,
        loginAs,
        logout,
        refreshUser,
      }}
    >
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  const context = useContext(RoleContext)
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider')
  }
  return context
}
