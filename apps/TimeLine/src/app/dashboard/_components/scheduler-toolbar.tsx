'use client'

import type { SchedulerViewMode } from '@/app/dashboard/_lib/scheduler-types'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Room } from '@/lib/types'
import { cn } from '@/lib/utils'

type SchedulerToolbarProps = {
  className?: string
  rooms: Room[]
  setViewMode: (_viewMode: SchedulerViewMode) => void
  viewMode: SchedulerViewMode
}

const VIEW_OPTIONS: SchedulerViewMode[] = ['week', 'day', 'month', 'year']

export function SchedulerToolbar({ className, rooms, setViewMode, viewMode }: SchedulerToolbarProps) {
  return (
    <div className={cn('grid gap-[5px] border-b border-[#e1dfdd] px-2 py-2 xl:grid-cols-[clamp(176px,18vw,212px)_minmax(0,1fr)] dark:border-border', className)}>
      <div className="flex h-12 items-center overflow-x-auto rounded-xl border border-[#d7d8f4] bg-[#f8f9ff] p-1 dark:border-[#3b3d62] dark:bg-[#1e2031]">
        {VIEW_OPTIONS.map((option) => (
          <button key={option} type="button" className={cn('rounded-lg px-3 py-2 text-xs font-semibold transition', viewMode === option ? 'bg-white text-foreground shadow-sm dark:bg-[#2b3150] dark:text-white' : 'text-muted-foreground hover:text-foreground dark:hover:text-white')} onClick={() => setViewMode(option)}>
            {option[0].toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>
      <div className="min-w-0">
        <TabsList className="h-12 w-full justify-start overflow-x-auto rounded-xl border border-[#d2d6dc] bg-[#f7f8fa] p-1.5 dark:border-border dark:bg-muted/30">
          <TabsTrigger value="all" className="min-w-[128px] rounded-lg border border-transparent px-4 py-2 font-semibold text-muted-foreground data-[state=active]:border-[#1a73e8] data-[state=active]:bg-[#e8f0fe] data-[state=active]:text-[#174ea6] data-[state=active]:shadow-none">All classes</TabsTrigger>
          {rooms.map((room) => <TabsTrigger key={room.id} value={room.id} className="min-w-[92px] rounded-lg border border-transparent px-4 py-2 font-semibold text-muted-foreground data-[state=active]:border-[#1a73e8] data-[state=active]:bg-[#e8f0fe] data-[state=active]:text-[#174ea6] data-[state=active]:shadow-none">{room.number}</TabsTrigger>)}
        </TabsList>
      </div>
    </div>
  )
}
