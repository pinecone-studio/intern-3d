'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getDemoUser } from './demo-users'
import type { User, UserRole } from './types'

const ROLE_STORAGE_KEY = 'timeline-role'

type RoleContextType = {
  user: User | null
  role: UserRole | null
  isReady: boolean
  setRole: (_role: UserRole) => void
  logout: () => void
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

function isUserRole(value: string | null): value is UserRole {
  return value === 'admin' || value === 'student'
}

function readStoredRole(): UserRole | null {
  if (typeof window === 'undefined') {
    return null
  }

  const storedRole = window.localStorage.getItem(ROLE_STORAGE_KEY)
  return isUserRole(storedRole) ? storedRole : null
}

function persistRole(role: UserRole) {
  window.localStorage.setItem(ROLE_STORAGE_KEY, role)
}

function clearStoredRole() {
  window.localStorage.removeItem(ROLE_STORAGE_KEY)
}

export function RoleProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const storedRole = readStoredRole()
    setUser(storedRole ? getDemoUser(storedRole) : null)
    setIsReady(true)
  }, [])

  const setRole = (role: UserRole) => {
    persistRole(role)
    setUser(getDemoUser(role))
  }

  const logout = () => {
    clearStoredRole()
    setUser(null)
  }

  return (
    <RoleContext.Provider
      value={{
        user,
        role: user?.role ?? null,
        isReady,
        setRole,
        logout,
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
