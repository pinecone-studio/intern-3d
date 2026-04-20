'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import type { User, UserRole } from './types'
import { demoUsers } from './mock-data'

type RoleContextType = {
  user: User | null
  role: UserRole | null
  setRole: (_role: UserRole) => void
  logout: () => void
}

const RoleContext = createContext<RoleContextType | undefined>(undefined)

export function RoleProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  const setRole = (role: UserRole) => {
    setUser(demoUsers[role])
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <RoleContext.Provider
      value={{
        user,
        role: user?.role ?? null,
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
