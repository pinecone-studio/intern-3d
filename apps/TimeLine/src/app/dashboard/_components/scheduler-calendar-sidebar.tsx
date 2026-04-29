'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CALENDAR_DAY_LETTERS } from '@/app/dashboard/_lib/scheduler-constants'
import { addDays, addMonths, formatMonthLabel, formatShortDate, isDateInSelectedWeek, isSameDate, isSameMonth } from '@/app/dashboard/_lib/scheduler-date-utils'
import type { SchedulerViewMode } from '@/app/dashboard/_lib/scheduler-types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type SchedulerCalendarSidebarProps = {
  calendarMonth: Date
  isCalendarOpen: boolean
  monthDays: Date[]
  onSelectDay: (_date: Date) => void
  setCalendarMonth: (_updater: (_current: Date) => Date) => void
  viewMode: SchedulerViewMode
  focusedDate: Date
  weekStart: Date
}

export function SchedulerCalendarSidebar({ calendarMonth, focusedDate, isCalendarOpen, monthDays, onSelectDay, setCalendarMonth, viewMode, weekStart }: SchedulerCalendarSidebarProps) {
  const helperText = viewMode === 'day' ? 'Өдөр сонгоод баруун талын timeline-г шинэчилнэ' : viewMode === 'month' ? 'Сар доторх өдөр дээр дарахад Day view рүү орно' : viewMode === 'year' ? 'Жилийн roadmap дараагийн PR дээр орно' : `Сонгосон 7 хоног: ${formatShortDate(weekStart)} - ${formatShortDate(addDays(weekStart, 6))}`

  return (
    <aside className={cn(isCalendarOpen ? 'block' : 'hidden', 'rounded-2xl border border-[#e5e7f3] bg-[#fbfbfe] p-3 shadow-sm dark:border-[#2c3149] dark:bg-[#171b27] xl:sticky xl:top-4 xl:block')}>
      <div className="mb-3 flex items-center justify-between"><div><p className="text-sm font-semibold text-foreground">{formatMonthLabel(calendarMonth)}</p><p className="text-xs text-muted-foreground">{helperText}</p></div><div className="flex items-center gap-1"><Button type="button" variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => setCalendarMonth((current) => addMonths(current, -1))} aria-label="Өмнөх сар"><ChevronLeft className="h-4 w-4" /></Button><Button type="button" variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => setCalendarMonth((current) => addMonths(current, 1))} aria-label="Дараагийн сар"><ChevronRight className="h-4 w-4" /></Button></div></div>
      <div className="mb-1.5 grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-muted-foreground">{CALENDAR_DAY_LETTERS.map((letter, index) => <span key={`${letter}-${index}`} className="py-1">{letter}</span>)}</div>
      <div className="grid grid-cols-7 gap-1">{monthDays.map((day) => { const inCurrentMonth = isSameMonth(day, calendarMonth); const inSelectedWeek = isDateInSelectedWeek(day, weekStart); const isToday = isSameDate(day, new Date()); return <button key={day.toISOString()} type="button" className={cn('flex h-8 items-center justify-center rounded-lg border text-[13px] font-medium transition', (viewMode === 'day' || viewMode === 'month') && isSameDate(day, focusedDate) && 'border-[#6264a7] bg-[#dfe3ff] text-[#282f5f] dark:border-[#99a0ff] dark:bg-[#36406e] dark:text-white', viewMode === 'week' && inSelectedWeek ? 'border-[#7b7fd6] bg-[#eceeff] text-[#323769] shadow-sm dark:border-[#8e92ff]/70 dark:bg-[#2a3152] dark:text-white' : 'border-transparent text-foreground/80 hover:border-[#d7d8f4] hover:bg-white dark:hover:border-[#353b59] dark:hover:bg-[#1f2434]', !inCurrentMonth && 'text-muted-foreground/45', isToday && !inSelectedWeek && 'border-[#c9cdfa] text-foreground dark:border-[#6166a7]')} onClick={() => onSelectDay(day)} aria-label={day.toDateString()}>{day.getDate()}</button> })}</div>
      <div className="mt-3 rounded-xl border border-dashed border-[#d7d8f4] bg-white/70 px-3 py-2 text-[11px] text-muted-foreground dark:border-[#323858] dark:bg-[#111522]">{viewMode === 'day' ? 'Өдөр дээр дармагц баруун талын day timeline шинэчлэгдэнэ.' : viewMode === 'month' ? 'Өдөр дээр дармагц month summary-гаас day timeline руу drill-down хийнэ.' : viewMode === 'year' ? 'Year roadmap-ийг дараагийн PR дээр холбоно.' : 'Өдөр дээр дармагц тухайн долоо хоногийн хуваарь баруун талд шинэчлэгдэнэ.'}</div>
    </aside>
  )
}
