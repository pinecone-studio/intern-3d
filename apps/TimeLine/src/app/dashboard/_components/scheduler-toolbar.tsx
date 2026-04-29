'use client'

import { CalendarDays, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { addDays, formatMonthLabel, formatShortDate } from '@/app/dashboard/_lib/scheduler-date-utils'
import type { SchedulerViewMode } from '@/app/dashboard/_lib/scheduler-types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type SchedulerToolbarProps = {
  calendarMonth: Date
  onCreate: () => void
  onShiftView: (_step: number) => void
  onToday: () => void
  onToggleCalendar: () => void
  setViewMode: (_viewMode: SchedulerViewMode) => void
  viewMode: SchedulerViewMode
  weekStart: Date
  isCalendarOpen: boolean
}

const VIEW_OPTIONS: SchedulerViewMode[] = ['week', 'day', 'month', 'year']

export function SchedulerToolbar({ calendarMonth, isCalendarOpen, onCreate, onShiftView, onToday, onToggleCalendar, setViewMode, viewMode, weekStart }: SchedulerToolbarProps) {
  const ariaLabel = viewMode === 'day' ? ['Өмнөх өдөр', 'Дараагийн өдөр'] : viewMode === 'month' ? ['Өмнөх сар', 'Дараагийн сар'] : viewMode === 'year' ? ['Өмнөх жил', 'Дараагийн жил'] : ['Өмнөх долоо хоног', 'Дараагийн долоо хоног']
  const description = viewMode === 'day' ? 'Day view' : viewMode === 'month' ? 'Month view' : viewMode === 'year' ? 'Year view' : `${formatShortDate(weekStart)} - ${formatShortDate(addDays(weekStart, 4))}`

  return (
    <div className="flex flex-col gap-3 border-b border-[#e1dfdd] px-4 py-3 dark:border-border lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center rounded-xl border border-[#d7d8f4] bg-[#f8f9ff] p-1 dark:border-[#3b3d62] dark:bg-[#1e2031]">{VIEW_OPTIONS.map((option) => <button key={option} type="button" className={cn('rounded-lg px-3 py-1.5 text-xs font-semibold transition', viewMode === option ? 'bg-white text-foreground shadow-sm dark:bg-[#2b3150] dark:text-white' : 'text-muted-foreground hover:text-foreground dark:hover:text-white')} onClick={() => setViewMode(option)}>{option[0].toUpperCase() + option.slice(1)}</button>)}</div>
        <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-xl" onClick={() => onShiftView(-7)} aria-label={ariaLabel[0]}><ChevronLeft className="h-4 w-4" /></Button>
        <button type="button" className="flex min-w-[196px] items-center gap-2.5 rounded-xl border border-[#d7d8f4] bg-[#f8f9ff] px-3.5 py-2 text-left shadow-sm transition hover:border-[#6264a7] hover:bg-[#eef0ff] dark:border-[#3b3d62] dark:bg-[#1e2031] dark:hover:border-[#8a8dd8] dark:hover:bg-[#252845]" onClick={onToggleCalendar} aria-expanded={isCalendarOpen} aria-label="Календарь харах"><CalendarDays className="h-4 w-4 shrink-0 text-[#6264a7]" /><div className="min-w-0"><p className="text-sm font-semibold leading-5 text-foreground">{formatMonthLabel(calendarMonth)}</p><p className="text-xs text-muted-foreground">{description}</p></div></button>
        <Button type="button" variant="outline" size="icon" className="h-8 w-8 rounded-xl" onClick={() => onShiftView(7)} aria-label={ariaLabel[1]}><ChevronRight className="h-4 w-4" /></Button>
        <Button type="button" variant="outline" size="sm" className="h-8 rounded-xl px-3" onClick={onToday}>Өнөөдөр</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2"><Button type="button" className="h-9 rounded-md bg-[#6264a7] hover:bg-[#5558a7]" onClick={onCreate}><Plus className="mr-2 h-4 w-4" />Шинэ</Button></div>
    </div>
  )
}
