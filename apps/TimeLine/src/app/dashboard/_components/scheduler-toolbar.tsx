'use client'

import { Plus } from 'lucide-react'
import type { SchedulerViewMode } from '@/app/dashboard/_lib/scheduler-types'
import { Button } from '@/components/ui/button'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Room } from '@/lib/types'
import { cn } from '@/lib/utils'

type SchedulerToolbarProps = {
  className?: string
  onCreateSchedule: () => void
  rooms: Room[]
  selectedRoomCount: number
  selectionCount: number
  setViewMode: (_viewMode: SchedulerViewMode) => void
  viewMode: SchedulerViewMode
}

const VIEW_OPTIONS: SchedulerViewMode[] = ['week', 'day', 'month', 'year']
const VIEW_LABELS: Record<SchedulerViewMode, string> = {
  week: '7 хоног',
  day: 'Өдөр',
  month: 'Сар',
  year: 'Жил',
}

export function SchedulerToolbar({ className, onCreateSchedule, rooms, selectedRoomCount, selectionCount, setViewMode, viewMode }: SchedulerToolbarProps) {
  const hasBatchSelection = selectionCount > 1

  return (
    <div className={cn('sticky top-[132px] z-[80] grid gap-[5px] border-b border-[#e1dfdd] bg-white px-2 py-2 shadow-sm lg:top-[65px] xl:grid-cols-[auto_clamp(176px,18vw,212px)_minmax(0,1fr)] dark:border-border dark:bg-card', className)}>
      <Button type="button" className="h-12 shrink-0 rounded-xl bg-[#6264a7] px-3 text-xs font-semibold hover:bg-[#5558a7]" onClick={onCreateSchedule}>
        <Plus className="h-4 w-4" />
        <span className="flex flex-col items-start leading-tight">
          <span>{hasBatchSelection ? 'Нэг дор үүсгэх' : 'Шинэ хуваарь'}</span>
          {hasBatchSelection ? <span className="text-[10px] font-medium opacity-85">{selectedRoomCount} өрөө · {selectionCount} slot</span> : null}
        </span>
      </Button>
      <div className="grid h-12 grid-cols-4 items-center gap-1 rounded-xl border border-[#d7d8f4] bg-[#f8f9ff] p-1 dark:border-[#3b3d62] dark:bg-[#1e2031]">
        {VIEW_OPTIONS.map((option) => (
          <button key={option} type="button" className={cn('flex h-9 min-w-0 items-center justify-center self-center rounded-lg px-2 py-2 text-center text-xs font-semibold leading-tight outline-none transition focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70', viewMode === option ? 'bg-white text-foreground dark:bg-[#2b3150] dark:text-white' : 'text-muted-foreground hover:text-foreground dark:hover:text-white')} onClick={() => setViewMode(option)}>
            {VIEW_LABELS[option]}
          </button>
        ))}
      </div>
      <div className="min-w-0">
        <TabsList className="h-12 w-full justify-start overflow-x-auto rounded-xl border border-[#d2d6dc] bg-[#f7f8fa] p-1.5 dark:border-border dark:bg-muted/30">
          <TabsTrigger value="all" className="min-w-[112px] rounded-lg border border-transparent px-3 py-2 font-semibold text-muted-foreground data-[state=active]:border-[#1a73e8] data-[state=active]:bg-[#e8f0fe] data-[state=active]:text-[#174ea6] data-[state=active]:shadow-none">Бүх анги</TabsTrigger>
          {rooms.map((room) => <TabsTrigger key={room.id} value={room.id} className="min-w-[78px] rounded-lg border border-transparent px-3 py-2 font-semibold text-muted-foreground data-[state=active]:border-[#1a73e8] data-[state=active]:bg-[#e8f0fe] data-[state=active]:text-[#174ea6] data-[state=active]:shadow-none">{room.number}</TabsTrigger>)}
        </TabsList>
      </div>
    </div>
  )
}
