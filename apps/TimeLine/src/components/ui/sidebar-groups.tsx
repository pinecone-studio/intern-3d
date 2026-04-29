'use client'

import { cn } from '@/lib/utils'

export function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-4 p-4', className)} {...props} />
}

export function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('mt-auto flex flex-col gap-2 border-t border-sidebar-border p-4', className)} {...props} />
}

export function SidebarContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto', className)} {...props} />
}

export function SidebarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('flex flex-col gap-2 px-2', className)} {...props} />
}

export function SidebarGroupLabel({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn('px-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground', className)}
      {...props}
    />
  )
}

export function SidebarGroupAction({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn(className)} {...props} />
}

export function SidebarGroupContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div className={cn('space-y-2', className)} {...props} />
}
