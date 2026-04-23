import { cn } from '@/lib/utils'
import type { RoomStatus } from '@/lib/types'
import { STATUS_CONFIG } from '@/lib/constants'

interface RoomStatusBadgeProps {
  status: RoomStatus
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function RoomStatusBadge({ status, size = 'md', className }: RoomStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border border-border bg-background font-medium text-foreground',
        sizeClasses[size],
        className
      )}
    >
      <span className={cn(
        'h-1.5 w-1.5 rounded-full',
        config.dotColor,
        status === 'available' && 'animate-pulse'
      )} />
      {config.label}
    </span>
  )
}
