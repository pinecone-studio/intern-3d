'use client'

import type { ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CALENDAR_DAY_LETTERS } from '@/app/dashboard/_lib/scheduler-constants'
import { addMonths, formatMonthLabel, formatMonthShortLabel, getYearMonths, isDateInSelectedWeek, isSameDate, isSameMonth } from '@/app/dashboard/_lib/scheduler-date-utils'
import type { SchedulerViewMode } from '@/app/dashboard/_lib/scheduler-types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type SchedulerCalendarSidebarProps = {
  calendarMonth: Date
  isCalendarOpen: boolean
  monthDays: Date[]
  onSelectDay: (_date: Date) => void
  onToday: () => void
  setCalendarMonth: (_updater: (_current: Date) => Date) => void
  summaryContent?: ReactNode
  viewMode: SchedulerViewMode
  focusedDate: Date
  weekStart: Date
}

export function SchedulerCalendarSidebar({ calendarMonth, focusedDate, isCalendarOpen, monthDays, onSelectDay, onToday, setCalendarMonth, summaryContent, viewMode, weekStart }: SchedulerCalendarSidebarProps) {
  const helperText = viewMode === 'day' ? 'Өдөр сонгоод баруун талын timeline-г шинэчилнэ' : viewMode === 'month' ? 'Сар сонгоод сарын matrix-г шинэчилнэ' : viewMode === 'year' ? 'Сар сонгоод жилийн тоймыг шинэчилнэ' : null
  const monthStep = viewMode === 'year' || viewMode === 'month' ? 12 : 1
  const yearMonths = viewMode === 'year' || viewMode === 'month' ? getYearMonths(calendarMonth) : []
  const sidebarTitle = viewMode === 'year' || viewMode === 'month' ? `${calendarMonth.getFullYear()} он` : formatMonthLabel(calendarMonth)

  return (
    <aside className={cn(isCalendarOpen ? 'block' : 'hidden', 'self-stretch rounded-2xl border border-[#e5e7f3] bg-[#fbfbfe] p-3 shadow-sm dark:border-[#2c3149] dark:bg-[#171b27] xl:block')}>
      <div className="mb-3 flex items-center justify-between"><div><p className="text-sm font-semibold text-foreground">{sidebarTitle}</p>{helperText ? <p className="text-xs text-muted-foreground">{helperText}</p> : null}</div><div className="flex items-center gap-1"><Button type="button" variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => setCalendarMonth((current) => addMonths(current, -monthStep))} aria-label="Өмнөх сар"><ChevronLeft className="h-4 w-4" /></Button><Button type="button" variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => setCalendarMonth((current) => addMonths(current, monthStep))} aria-label="Дараагийн сар"><ChevronRight className="h-4 w-4" /></Button></div></div>
      {viewMode === 'year' || viewMode === 'month' ? (
        <div className="grid grid-cols-3 gap-1.5">
          {yearMonths.map((month) => (
            <button
              key={month.toISOString()}
              type="button"
              className={cn(
                'h-9 rounded-lg border text-[11px] font-medium transition',
                isSameMonth(month, calendarMonth)
                  ? 'border-[#6264a7] bg-[#dfe3ff] text-[#282f5f] dark:border-[#99a0ff] dark:bg-[#36406e] dark:text-white'
                  : 'border-transparent bg-white/70 text-foreground/80 hover:border-[#d7d8f4] hover:bg-white dark:bg-[#111522] dark:hover:border-[#353b59] dark:hover:bg-[#1f2434]',
              )}
              onClick={() => onSelectDay(month)}
            >
              {formatMonthShortLabel(month)}
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="mb-1.5 grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-muted-foreground">{CALENDAR_DAY_LETTERS.map((letter, index) => <span key={`${letter}-${index}`} className="py-1">{letter}</span>)}</div>
          <div className="grid grid-cols-7 gap-1">{monthDays.map((day) => { const inCurrentMonth = isSameMonth(day, calendarMonth); const inSelectedWeek = isDateInSelectedWeek(day, weekStart); const isToday = isSameDate(day, new Date()); return <button key={day.toISOString()} type="button" className={cn('flex h-8 items-center justify-center rounded-lg border text-[13px] font-medium transition', (viewMode === 'day' || viewMode === 'month') && isSameDate(day, focusedDate) && 'border-[#6264a7] bg-[#dfe3ff] text-[#282f5f] dark:border-[#99a0ff] dark:bg-[#36406e] dark:text-white', viewMode === 'week' && inSelectedWeek ? 'border-[#7b7fd6] bg-[#eceeff] text-[#323769] shadow-sm dark:border-[#8e92ff]/70 dark:bg-[#2a3152] dark:text-white' : 'border-transparent text-foreground/80 hover:border-[#d7d8f4] hover:bg-white dark:hover:border-[#353b59] dark:hover:bg-[#1f2434]', !inCurrentMonth && 'text-muted-foreground/45', isToday && !inSelectedWeek && 'border-[#c9cdfa] text-foreground dark:border-[#6166a7]')} onClick={() => onSelectDay(day)} aria-label={day.toDateString()}>{day.getDate()}</button> })}</div>
        </>
      )}
      <Button type="button" variant="outline" className="mt-3 h-9 w-full rounded-lg" onClick={onToday}>Өнөөдөр</Button>
      {summaryContent ? <div className="mt-3 rounded-2xl border border-dashed border-[#d7d8f4] bg-white/80 p-3 text-sm dark:border-[#323858] dark:bg-[#111522]">{summaryContent}</div> : null}
    </aside>
  )
}
