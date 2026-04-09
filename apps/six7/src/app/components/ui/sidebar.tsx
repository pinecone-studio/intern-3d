'use client'

import * as React from 'react'
import { PanelLeft } from 'lucide-react'

import { cn } from '@/lib/utils'

type SidebarContextValue = {
  openMobile: boolean
  setOpenMobile: React.Dispatch<React.SetStateAction<boolean>>
  toggleMobile: () => void
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)

  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider')
  }

  return context
}

function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [openMobile, setOpenMobile] = React.useState(false)

  return (
    <SidebarContext.Provider
      value={{
        openMobile,
        setOpenMobile,
        toggleMobile: () => setOpenMobile((open) => !open),
      }}
    >
      <div className="min-h-screen bg-background lg:flex">{children}</div>
    </SidebarContext.Provider>
  )
}

function SidebarInset({ className, ...props }: React.ComponentProps<'main'>) {
  return (
    <main
      className={cn('flex min-h-screen flex-1 flex-col', className)}
      {...props}
    />
  )
}

function Sidebar({ className, children }: React.ComponentProps<'aside'>) {
  const { openMobile, setOpenMobile } = useSidebar()

  return (
    <>
      <aside
        className={cn(
          'hidden h-screen w-[260px] shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex lg:flex-col',
          className,
        )}
      >
        {children}
      </aside>
      {openMobile && (
        <div className="fixed inset-0 z-50 bg-black/60 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0"
            onClick={() => setOpenMobile(false)}
          />
          <aside
            className={cn(
              'relative z-10 flex h-full w-[260px] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl',
              className,
            )}
          >
            {children}
          </aside>
        </div>
      )}
    </>
  )
}

function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('border-b border-sidebar-border', className)} {...props} />
  )
}

function SidebarContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('flex flex-1 flex-col', className)} {...props} />
  )
}

function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('mt-auto border-t border-sidebar-border', className)} {...props} />
  )
}

function SidebarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('px-3 py-4', className)} {...props} />
  )
}

function SidebarGroupLabel({
  className,
  ...props
}: React.ComponentProps<'p'>) {
  return (
    <p
      className={cn('px-3 pb-3 text-xs uppercase tracking-[0.22em] text-muted-foreground', className)}
      {...props}
    />
  )
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div className={cn('space-y-1', className)} {...props} />
  )
}

function SidebarMenu({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div className={cn('space-y-1', className)} {...props} />
  )
}

function SidebarMenuItem({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div className={cn(className)} {...props} />
  )
}

function SidebarMenuButton({
  className,
  isActive,
  ...props
}: React.ComponentProps<'div'> & { isActive?: boolean }) {
  return (
    <div
      data-active={isActive ? 'true' : 'false'}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground',
        className,
      )}
      {...props}
    />
  )
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<'button'>) {
  const { toggleMobile } = useSidebar()

  return (
    <button
      type="button"
      aria-label="Open navigation"
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden',
        className,
      )}
      onClick={(event) => {
        toggleMobile()
        onClick?.(event)
      }}
      {...props}
    >
      <PanelLeft className="h-4 w-4" strokeWidth={1.8} />
    </button>
  )
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
}
