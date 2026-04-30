'use client'

import Link from 'next/link'
import { VISIBLE_HOUR_MARKS } from '@/app/dashboard/_lib/scheduler-constants'
import { formatMonthLabel, isSameDate } from '@/app/dashboard/_lib/scheduler-date-utils'
import { getEventLabel } from '@/app/dashboard/_lib/scheduler-event-utils'
import { getEventMarkerTone, getEventMatrixKey, getMonthOccurrences } from '@/app/dashboard/_lib/scheduler-matrix-utils'
import { timeToMinutes } from '@/app/dashboard/_lib/scheduler-time-utils'
import type { MatrixAxisMode, MonthSummary, MonthViewFilter } from '@/app/dashboard/_lib/scheduler-types'
import { SchedulerMatrixAxisToggle } from '@/app/dashboard/_components/scheduler-matrix-axis-toggle'
import { SchedulerMonthTransposeTable } from '@/app/dashboard/_components/scheduler-month-transpose-table'
import type { Room, ScheduleEvent } from '@/lib/types'
import { cn } from '@/lib/utils'

type SchedulerMonthSummaryViewProps = {
  calendarMonth: Date
  focusedDate: Date
  matrixAxisMode: MatrixAxisMode
  monthFilter: MonthViewFilter
  monthFilterTotals: Record<MonthViewFilter, number>
  monthSummaries: MonthSummary[]
  rooms: Room[]
  selectedRoomView: Room | null
  onAxisModeChange: (_mode: MatrixAxisMode) => void
  onFilterChange: (_filter: MonthViewFilter) => void
  onSelectDate: (_date: Date) => void
}

const filterOptions: Array<{ key: MonthViewFilter; label: string }> = [
  { key: 'all', label: 'Бүгд' },
  { key: 'class', label: 'Хичээл' },
  { key: 'club', label: 'Клуб' },
  { key: 'event', label: 'Event' },
]
const MONTH_STICKY_WIDTH = '8rem'
const MONTH_TIME_ROW_HEIGHT = 34
const weekdayFormatter = new Intl.DateTimeFormat('mn-MN', { weekday: 'short' })

function getTimeSlotBounds(slotIndex: number) {
  const startHour = VISIBLE_HOUR_MARKS[slotIndex]
  const nextHour = VISIBLE_HOUR_MARKS[slotIndex + 1] ?? startHour + 1
  return { start: startHour * 60, end: nextHour * 60 }
}

function getSlotEvents(summary: MonthSummary, room: Room, slotIndex: number, filter: MonthViewFilter) {
  const bounds = getTimeSlotBounds(slotIndex)
  const seen = new Set<string>()
  return getMonthOccurrences(summary, room.id, filter)
    .map(({ event }) => event)
    .filter((event) => {
      const start = timeToMinutes(event.startTime)
      const key = getEventMatrixKey(event)
      if (start < bounds.start || start >= bounds.end || seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((left, right) => timeToMinutes(left.startTime) - timeToMinutes(right.startTime) || left.title.localeCompare(right.title, 'mn'))
}

function getEventSetKey(events: ScheduleEvent[]) {
  return events.map(getEventMatrixKey).join('|')
}

function getSlotSegments(summaries: MonthSummary[], room: Room, slotIndex: number, filter: MonthViewFilter) {
  const segments: Array<{ events: ScheduleEvent[]; key: string; span: number; summaries: MonthSummary[] }> = []
  let index = 0
  while (index < summaries.length) {
    const events = getSlotEvents(summaries[index], room, slotIndex, filter)
    if (events.length === 0) {
      segments.push({ events, key: `empty-${summaries[index].dateIso}`, span: 1, summaries: [summaries[index]] })
      index += 1
      continue
    }
    const eventSetKey = getEventSetKey(events)
    let span = 1
    while (index + span < summaries.length && getEventSetKey(getSlotEvents(summaries[index + span], room, slotIndex, filter)) === eventSetKey) span += 1
    segments.push({ events, key: `${eventSetKey}-${summaries[index].dateIso}`, span, summaries: summaries.slice(index, index + span) })
    index += span
  }
  return segments
}

function getEventBlockStyle(event: ScheduleEvent, slotIndex: number) {
  const bounds = getTimeSlotBounds(slotIndex)
  const slotMinutes = bounds.end - bounds.start
  const start = Math.max(bounds.start, timeToMinutes(event.startTime))
  const end = Math.max(start + 15, timeToMinutes(event.endTime))
  return {
    height: `${Math.max(24, ((end - start) / slotMinutes) * MONTH_TIME_ROW_HEIGHT - 4)}px`,
    top: `${((start - bounds.start) / slotMinutes) * MONTH_TIME_ROW_HEIGHT + 2}px`,
  }
}

function EventCard({ event, slotIndex }: { event: ScheduleEvent; slotIndex: number }) {
  return (
    <div className={cn('absolute left-0.5 right-0.5 z-[8] overflow-hidden rounded-md border border-l-4 px-1 py-0.5 text-left text-[9px] font-semibold leading-tight shadow-sm', getEventMarkerTone(event.type))} style={getEventBlockStyle(event, slotIndex)} title={`${event.title} ${event.startTime}-${event.endTime} ${getEventLabel(event.type)}`}>
      <div className="truncate">{event.title}</div>
      <div className="truncate font-medium opacity-75">{event.startTime}-{event.endTime}</div>
    </div>
  )
}

function SegmentCell({ events, onSelectDate, room, slotIndex, span, summaries }: { events: ScheduleEvent[]; onSelectDate: (_date: Date) => void; room: Room; slotIndex: number; span: number; summaries: MonthSummary[] }) {
  const hasToday = summaries.some((summary) => isSameDate(summary.date, new Date()))
  const isWeekendOnly = summaries.every((summary) => summary.isWeekend)
  return (
    <td colSpan={span} className={cn('h-[34px] overflow-visible border-b border-r border-[#edebe9] p-0 align-top dark:border-border/60', hasToday && 'bg-[#fffbe8]', isWeekendOnly && 'bg-[#fafbff] dark:bg-[#161a27]')}>
      <button type="button" className="relative h-[34px] w-full rounded-sm text-left transition hover:bg-[#f8f9ff] dark:hover:bg-[#1d2131]" onClick={() => onSelectDate(summaries[0].date)} aria-label={`${room.number} ${summaries[0].dateIso}`}>
        {events.map((event) => <EventCard key={getEventMatrixKey(event)} event={event} slotIndex={slotIndex} />)}
      </button>
    </td>
  )
}

export function SchedulerMonthSummaryView({ calendarMonth, focusedDate, matrixAxisMode, monthFilter, monthFilterTotals, monthSummaries, onAxisModeChange, onFilterChange, onSelectDate, rooms, selectedRoomView }: SchedulerMonthSummaryViewProps) {
  const currentSummaries = monthSummaries.filter((summary) => summary.isCurrentMonth)

  return (
    <div className="flex h-[calc(100vh-190px)] min-h-[520px] flex-col bg-white dark:bg-card">
      <div className="shrink-0 border-b border-[#e1dfdd] bg-white px-4 py-3 dark:border-border dark:bg-card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-sm font-semibold text-foreground">{formatMonthLabel(calendarMonth)} matrix</p><p className="text-xs text-muted-foreground">{selectedRoomView ? `${selectedRoomView.number} ангийн сарын харагдац` : 'Бүх ангийн сарын matrix'}</p></div><div className="flex flex-wrap items-center gap-2"><SchedulerMatrixAxisToggle mode={matrixAxisMode} onModeChange={onAxisModeChange} timeColumnLabel="Өдөр багана" timeRowLabel="Өдөр мөр" />{filterOptions.map((option) => <button key={option.key} type="button" className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition', monthFilter === option.key ? 'border-[#6264a7] bg-[#eef0ff] text-[#323769] dark:border-[#8f93ff] dark:bg-[#252b45] dark:text-white' : 'border-[#d9dbea] bg-white text-muted-foreground hover:border-[#bec2e5] hover:text-foreground dark:border-[#30364d] dark:bg-[#171b27] dark:hover:text-white')} onClick={() => onFilterChange(option.key)}><span>{option.label}</span><span className="rounded-full bg-black/5 px-1.5 py-0.5 text-[10px] dark:bg-white/10">{monthFilterTotals[option.key]}</span></button>)}</div></div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
      {matrixAxisMode === 'time-rows' ? <SchedulerMonthTransposeTable currentSummaries={currentSummaries} focusedDate={focusedDate} monthFilter={monthFilter} onSelectDate={onSelectDate} rooms={rooms} /> : (
      <table className="w-full table-fixed border-separate border-spacing-0 text-left text-xs">
        <colgroup><col className="w-20" /><col className="w-12" />{currentSummaries.map((summary) => <col key={summary.dateIso} style={{ width: `calc((100% - ${MONTH_STICKY_WIDTH}) / ${currentSummaries.length})` }} />)}</colgroup>
        <thead className="sticky top-0 z-[60] bg-white dark:bg-card"><tr><th className="sticky left-0 z-[70] w-20 border-b border-r border-[#e1dfdd] bg-white px-2 py-2 text-center text-muted-foreground dark:border-border dark:bg-card">Анги</th><th className="sticky left-20 z-[70] w-12 border-b border-r border-[#e1dfdd] bg-white px-1 py-2 text-center text-muted-foreground dark:border-border dark:bg-card">Цаг</th>{currentSummaries.map((summary) => <th key={summary.dateIso} className={cn('overflow-hidden border-b border-r border-[#e1dfdd] bg-white px-0.5 py-2 text-center font-semibold text-foreground dark:border-border dark:bg-card', isSameDate(summary.date, focusedDate) && 'bg-[#eef0ff] dark:bg-[#252b45]')}><div className="text-[11px]">{summary.date.getDate()}</div><div className="truncate text-[9px] font-normal text-muted-foreground">{weekdayFormatter.format(summary.date)}</div></th>)}</tr></thead>
        <tbody>{rooms.map((room) => VISIBLE_HOUR_MARKS.map((hour, slotIndex) => (
          <tr key={`${room.id}-${hour}`}>{slotIndex === 0 ? <th rowSpan={VISIBLE_HOUR_MARKS.length} className="sticky left-0 z-[40] w-20 border-b border-r border-[#e1dfdd] bg-[#faf9f8] px-2 py-2 text-center align-middle dark:border-border dark:bg-muted/30"><Link href={`/dashboard/room/${room.id}`} className="flex min-h-14 flex-col items-center justify-center"><span className="block text-sm font-semibold text-foreground">{room.number}</span><span className="text-[10px] font-normal text-muted-foreground">{room.type === 'lab' ? 'Lab' : 'Event hall'}</span></Link></th> : null}<th className="sticky left-20 z-[35] w-12 border-b border-r border-[#e1dfdd] bg-white px-1 py-1 text-center align-top text-[10px] font-semibold text-muted-foreground dark:border-border dark:bg-card">{hour}:00</th>{getSlotSegments(currentSummaries, room, slotIndex, monthFilter).map((segment) => <SegmentCell key={`${room.id}-${hour}-${segment.key}`} events={segment.events} onSelectDate={onSelectDate} room={room} slotIndex={slotIndex} span={segment.span} summaries={segment.summaries} />)}</tr>
        )))}</tbody>
      </table>
      )}
      </div>
    </div>
  )
}
