'use client'

import type { MatrixAxisMode } from '@/app/dashboard/_lib/scheduler-types'
import { cn } from '@/lib/utils'

type SchedulerMatrixAxisToggleProps = {
  mode: MatrixAxisMode
  onModeChange: (_mode: MatrixAxisMode) => void
  timeColumnLabel: string
  timeRowLabel: string
}

export function SchedulerMatrixAxisToggle({ mode, onModeChange, timeColumnLabel, timeRowLabel }: SchedulerMatrixAxisToggleProps) {
  const options: Array<{ key: MatrixAxisMode; label: string }> = [
    { key: 'time-columns', label: timeColumnLabel },
    { key: 'time-rows', label: timeRowLabel },
  ]

  return (
    <div className="inline-flex rounded-full border border-[#d9dbea] bg-white p-0.5 text-xs dark:border-[#30364d] dark:bg-[#171b27]">
      {options.map((option) => (
        <button key={option.key} type="button" className={cn('rounded-full px-3 py-1.5 font-medium transition', mode === option.key ? 'bg-[#6264a7] text-white shadow-sm' : 'text-muted-foreground hover:text-foreground dark:hover:text-white')} onClick={() => onModeChange(option.key)}>
          {option.label}
        </button>
      ))}
    </div>
  )
}
