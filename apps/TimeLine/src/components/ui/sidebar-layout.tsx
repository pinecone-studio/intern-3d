'use client'

import { PanelLeftIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar-context'
import { cn } from '@/lib/utils'

export function Sidebar({ className, children, ...props }: React.ComponentProps<'aside'>) {
  const { isMobile, open, setOpen } = useSidebar()

  if (isMobile) {
    return (
      <>
        {open && (
          <button
            type="button"
            aria-label="Close sidebar"
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={() => setOpen(false)}
          />
        )}
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-xl transition-transform md:hidden',
            open ? 'translate-x-0' : '-translate-x-full',
            className,
          )}
          {...props}
        >
          <div className="flex h-full flex-col">{children}</div>
        </aside>
      </>
    )
  }

  return (
    <aside
      className={cn(
        'hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 md:flex',
        open ? 'w-64' : 'w-0 overflow-hidden border-r-0',
        className,
      )}
      {...props}
    >
      <div className={cn('flex h-full w-64 shrink-0 flex-col', !open && 'hidden')}>{children}</div>
    </aside>
  )
}

export function SidebarInset({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex min-h-screen min-w-0 flex-1 flex-col', className)} {...props} />
}

export function SidebarTrigger({ className, ...props }: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button variant="ghost" size="icon" className={cn('h-9 w-9', className)} onClick={toggleSidebar} {...props}>
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
}
