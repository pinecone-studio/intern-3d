import type { JobStatus } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type StatusBadgeProps = {
  status: JobStatus
  className?: string
}

const statusConfig: Record<JobStatus, { label: string; className: string }> = {
  success: {
    label: 'Success',
    className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  processing: {
    label: 'Processing',
    className: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-500/15 text-red-400 border-red-500/30',
  },
  pending: {
    label: 'Pending',
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  warning: {
    label: 'Warning',
    className: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      <span className="mr-1.5 size-1.5 rounded-full bg-current" />
      {config.label}
    </Badge>
  )
}
