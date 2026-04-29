'use client'

import { cn } from '@/lib/utils'

export function SchedulerLegend({ color, label }: { color: string; label: string }) {
  return <span className="inline-flex items-center gap-1.5"><span className={cn('h-2.5 w-2.5 rounded-sm', color)} />{label}</span>
}
