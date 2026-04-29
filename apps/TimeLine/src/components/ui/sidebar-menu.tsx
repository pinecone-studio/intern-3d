'use client'

import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

export function SidebarMenu({ className, ...props }: React.ComponentProps<'ul'>) {
  return <ul className={cn('space-y-1', className)} {...props} />
}

export function SidebarMenuItem({ className, ...props }: React.ComponentProps<'li'>) {
  return <li className={cn(className)} {...props} />
}

export function SidebarMenuButton({
  asChild = false,
  isActive = false,
  className,
  ...props
}: React.ComponentProps<'button'> & {
  asChild?: boolean
  isActive?: boolean
}) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      className={cn(
        'flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors',
        isActive
          ? 'bg-sidebar-primary/10 text-sidebar-primary'
          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        className,
      )}
      {...props}
    />
  )
}
