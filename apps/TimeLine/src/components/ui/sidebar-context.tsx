'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type SidebarContextValue = {
  isMobile: boolean
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) throw new Error('useSidebar must be used within a SidebarProvider.')
  return context
}

export function SidebarProvider({ children, className, ...props }: React.ComponentProps<'div'>) {
  const [open, setOpen] = React.useState(true)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)')
    const updateState = (event?: MediaQueryListEvent) => {
      const nextIsMobile = event?.matches ?? mediaQuery.matches
      setIsMobile(nextIsMobile)
      setOpen(!nextIsMobile)
    }

    updateState()
    mediaQuery.addEventListener('change', updateState)
    return () => mediaQuery.removeEventListener('change', updateState)
  }, [])

  const toggleSidebar = React.useCallback(() => {
    setOpen((current) => !current)
  }, [])

  return (
    <SidebarContext.Provider value={{ isMobile, open, setOpen, toggleSidebar }}>
      <div className={cn('flex min-h-screen w-full bg-background text-foreground', className)} {...props}>
        {children}
      </div>
    </SidebarContext.Provider>
  )
}
