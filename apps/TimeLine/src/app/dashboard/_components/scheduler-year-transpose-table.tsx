'use client'

import Link from 'next/link'
import { getEventDateRangeLabel } from '@/app/dashboard/_lib/scheduler-event-utils'
import { getEventMarkerTone } from '@/app/dashboard/_lib/scheduler-matrix-utils'
import type { MonthViewFilter, YearMonthSummary } from '@/app/dashboard/_lib/scheduler-types'
import type { Room, ScheduleEvent } from '@/lib/types'
import { cn } from '@/lib/utils'

type SchedulerYearTransposeTableProps = {
  calendarMonth: Date
  rooms: Room[]
  yearFilter: MonthViewFilter
  yearSummaries: YearMonthSummary[]
  onSelectMonth: (_date: Date) => void
}

const yearTypeOptions: Array<{ label: string; type: ScheduleEvent['type'] }> = [
  { type: 'class', label: 'Хичээл' },
  { type: 'club', label: 'Клуб' },
  { type: 'event', label: 'Event' },
]

function getVisibleYearTypes(filter: MonthViewFilter) {
  return filter === 'all' ? yearTypeOptions : yearTypeOptions.filter((option) => option.type === filter)
}

function getMonthTypeEvents(summary: YearMonthSummary, roomId: string, type: ScheduleEvent['type']) {
  const timeline = summary.roomTimelines.find((roomTimeline) => roomTimeline.roomId === roomId)
  return (timeline?.events ?? [])
    .map(({ event }) => event)
    .filter((event) => event.type === type)
    .sort((left, right) => left.startTime.localeCompare(right.startTime) || left.title.localeCompare(right.title, 'mn'))
}

function EventBlock({ event }: { event: ScheduleEvent }) {
  return (
    <div className={cn('rounded-md border border-l-4 px-1.5 py-0.5 text-left text-[10px] font-semibold leading-tight shadow-sm', getEventMarkerTone(event.type))} title={`${event.title} ${event.startTime}-${event.endTime} ${getEventDateRangeLabel(event)}`}>
      <div className="truncate">{event.title}</div>
      <div className="truncate font-medium opacity-75">{event.startTime}-{event.endTime}</div>
      <div className="truncate font-medium opacity-70">{getEventDateRangeLabel(event)}</div>
    </div>
  )
}

function TypeCell({ events, onSelectMonth, room, summary, type }: { events: ScheduleEvent[]; onSelectMonth: (_date: Date) => void; room: Room; summary: YearMonthSummary; type: ScheduleEvent['type'] }) {
  const visibleEvents = events.slice(0, 2)
  return (
    <td className="h-16 min-w-36 border-b border-r border-[#edebe9] p-1 align-middle dark:border-border/60">
      <button type="button" className="flex h-full w-full flex-col justify-center gap-1 rounded-md transition hover:bg-[#f8f9ff] dark:hover:bg-[#1d2131]" onClick={() => onSelectMonth(summary.monthStart)} aria-label={`${room.number} ${summary.shortLabel} ${type}`}>
        {visibleEvents.map((event) => <EventBlock key={event.id} event={event} />)}
        {events.length > visibleEvents.length ? <span className="text-[10px] font-medium text-muted-foreground">+{events.length - visibleEvents.length} хуваарь</span> : null}
      </button>
    </td>
  )
}

export function SchedulerYearTransposeTable({ calendarMonth, onSelectMonth, rooms, yearFilter, yearSummaries }: SchedulerYearTransposeTableProps) {
  const visibleTypes = getVisibleYearTypes(yearFilter)

  return (
    <table className="min-w-max border-separate border-spacing-0 text-left text-xs">
      <thead className="sticky top-0 z-[60] bg-white dark:bg-card">
        <tr>
          <th rowSpan={2} className="sticky left-0 z-[70] min-w-28 border-b border-r border-[#e1dfdd] bg-white px-3 py-2 text-center text-muted-foreground dark:border-border dark:bg-card">Сар</th>
          {rooms.map((room) => <th key={room.id} colSpan={visibleTypes.length} className="border-b border-r border-[#e1dfdd] bg-white px-3 py-2 text-center dark:border-border dark:bg-card"><Link href={`/dashboard/room/${room.id}`} className="font-semibold text-foreground hover:text-[#6264a7]">{room.number}</Link><div className="text-[10px] font-normal text-muted-foreground">{room.type === 'lab' ? 'Lab' : 'Event hall'}</div></th>)}
        </tr>
        <tr>
          {rooms.flatMap((room) => visibleTypes.map((option) => <th key={`${room.id}-${option.type}`} className="min-w-36 border-b border-r border-[#e1dfdd] bg-white px-2 py-1.5 text-center text-[10px] font-semibold text-muted-foreground dark:border-border dark:bg-card">{option.label}</th>))}
        </tr>
      </thead>
      <tbody>
        {yearSummaries.map((summary) => (
          <tr key={summary.monthStart.toISOString()}>
            <th className={cn('sticky left-0 z-[40] min-w-28 border-b border-r border-[#e1dfdd] bg-[#faf9f8] px-3 py-2 text-center align-middle dark:border-border dark:bg-muted/30', summary.monthStart.getMonth() === calendarMonth.getMonth() && 'bg-[#eef0ff] dark:bg-[#252b45]')}>
              <button type="button" className="flex min-h-14 w-full flex-col items-center justify-center" onClick={() => onSelectMonth(summary.monthStart)}>
                <span className="text-sm font-semibold text-foreground">{summary.shortLabel}</span>
                <span className="text-[10px] font-normal text-muted-foreground">{summary.activeDays} өдөр</span>
              </button>
            </th>
            {rooms.flatMap((room) => visibleTypes.map((option) => <TypeCell key={`${summary.monthStart.toISOString()}-${room.id}-${option.type}`} events={getMonthTypeEvents(summary, room.id, option.type)} onSelectMonth={onSelectMonth} room={room} summary={summary} type={option.type} />))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
