'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { VISIBLE_HOUR_MARKS } from '@/app/dashboard/_lib/scheduler-constants'
import { isSameDate } from '@/app/dashboard/_lib/scheduler-date-utils'
import { getEventDateRangeLabel, getEventLabel } from '@/app/dashboard/_lib/scheduler-event-utils'
import { getEventMarkerTone, getEventMatrixKey, getMonthOccurrences } from '@/app/dashboard/_lib/scheduler-matrix-utils'
import { timeToMinutes } from '@/app/dashboard/_lib/scheduler-time-utils'
import type { MonthSummary, MonthViewFilter } from '@/app/dashboard/_lib/scheduler-types'
import type { Room, ScheduleEvent } from '@/lib/types'
import { cn } from '@/lib/utils'

type SchedulerMonthTransposeTableProps = {
  currentSummaries: MonthSummary[]
  focusedDate: Date
  monthFilter: MonthViewFilter
  rooms: Room[]
  onSelectDate: (_date: Date) => void
}

const weekdayFormatter = new Intl.DateTimeFormat('mn-MN', { weekday: 'short' })

function getTimeSlotBounds(slotIndex: number) {
  const startHour = VISIBLE_HOUR_MARKS[slotIndex]
  const nextHour = VISIBLE_HOUR_MARKS[slotIndex + 1] ?? startHour + 1
  return { start: startHour * 60, end: nextHour * 60 }
}

function getEventSlotSpan(event: ScheduleEvent) {
  const start = timeToMinutes(event.startTime)
  const end = timeToMinutes(event.endTime)
  let startIndex = -1
  let endIndex = -1
  VISIBLE_HOUR_MARKS.forEach((_, slotIndex) => {
    const bounds = getTimeSlotBounds(slotIndex)
    if (bounds.end > start && bounds.start < end) {
      if (startIndex === -1) startIndex = slotIndex
      endIndex = slotIndex
    }
  })
  return startIndex >= 0 && endIndex >= startIndex ? { endIndex, startIndex } : null
}

function getSummaryEvents(summary: MonthSummary, room: Room, filter: MonthViewFilter) {
  const seen = new Set<string>()
  return getMonthOccurrences(summary, room.id, filter)
    .map(({ event }) => event)
    .filter((event) => {
      const key = getEventMatrixKey(event)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((left, right) => timeToMinutes(left.startTime) - timeToMinutes(right.startTime) || left.title.localeCompare(right.title, 'mn'))
}

function EventBlock({ event }: { event: ScheduleEvent }) {
  return (
    <div className={cn('rounded-md border border-l-4 px-1.5 py-0.5 text-left text-[10px] font-semibold leading-tight shadow-sm', getEventMarkerTone(event.type))} title={`${event.title} ${event.startTime}-${event.endTime} ${getEventDateRangeLabel(event)}`}>
      <div className="truncate">{event.title}</div>
      <div className="truncate font-medium opacity-75">{event.startTime}-{event.endTime} · {getEventLabel(event.type)}</div>
    </div>
  )
}

function RoomTimeCells({ filter, onSelectDate, room, summary }: { filter: MonthViewFilter; onSelectDate: (_date: Date) => void; room: Room; summary: MonthSummary }) {
  const entries = getSummaryEvents(summary, room, filter)
    .map((event) => ({ event, key: getEventMatrixKey(event), span: getEventSlotSpan(event) }))
    .filter((entry): entry is { event: ScheduleEvent; key: string; span: { endIndex: number; startIndex: number } } => entry.span !== null)
  const rendered = new Set<string>()
  const cells: ReactNode[] = []
  let slotIndex = 0
  while (slotIndex < VISIBLE_HOUR_MARKS.length) {
    const startingEntries = entries.filter((entry) => !rendered.has(entry.key) && entry.span.startIndex === slotIndex)
    if (startingEntries.length === 0) {
      cells.push(<td key={`${room.id}-${summary.dateIso}-${slotIndex}`} className="h-16 min-w-16 border-b border-r border-[#edebe9] p-1 text-center align-middle dark:border-border/60"><button type="button" className="h-full w-full rounded-md transition hover:bg-[#f8f9ff] dark:hover:bg-[#1d2131]" onClick={() => onSelectDate(summary.date)} aria-label={`${room.number} ${summary.dateIso} ${VISIBLE_HOUR_MARKS[slotIndex]}:00`} /></td>)
      slotIndex += 1
      continue
    }
    const cellEntries = [...startingEntries]
    let spanEnd = Math.max(...startingEntries.map((entry) => entry.span.endIndex))
    let extended = true
    while (extended) {
      extended = false
      entries.forEach((entry) => {
        if (rendered.has(entry.key) || cellEntries.some((cellEntry) => cellEntry.key === entry.key)) return
        if (entry.span.startIndex < slotIndex || entry.span.startIndex > spanEnd) return
        cellEntries.push(entry)
        if (entry.span.endIndex > spanEnd) {
          spanEnd = entry.span.endIndex
          extended = true
        }
      })
    }
    cellEntries.forEach((entry) => rendered.add(entry.key))
    cells.push(
      <td key={`${room.id}-${summary.dateIso}-${slotIndex}-events`} colSpan={spanEnd - slotIndex + 1} className="h-16 min-w-16 border-b border-r border-[#edebe9] p-1 align-middle dark:border-border/60">
        <button type="button" className="flex h-full w-full flex-col justify-center gap-1 rounded-md transition hover:bg-[#f8f9ff] dark:hover:bg-[#1d2131]" onClick={() => onSelectDate(summary.date)} aria-label={`${room.number} ${summary.dateIso}`}>
          {cellEntries.map((entry) => <EventBlock key={entry.key} event={entry.event} />)}
        </button>
      </td>
    )
    slotIndex = spanEnd + 1
  }
  return (
    <>{cells}</>
  )
}

export function SchedulerMonthTransposeTable({ currentSummaries, focusedDate, monthFilter, onSelectDate, rooms }: SchedulerMonthTransposeTableProps) {
  return (
    <table className="min-w-max border-separate border-spacing-0 text-left text-xs">
      <thead className="sticky top-0 z-[60] bg-white dark:bg-card">
        <tr>
          <th rowSpan={2} className="sticky left-0 z-[70] min-w-24 border-b border-r border-[#e1dfdd] bg-white px-3 py-2 text-center text-muted-foreground dark:border-border dark:bg-card">Өдөр</th>
          {rooms.map((room) => <th key={room.id} colSpan={VISIBLE_HOUR_MARKS.length} className="border-b border-r border-[#e1dfdd] bg-white px-3 py-2 text-center dark:border-border dark:bg-card"><Link href={`/dashboard/room/${room.id}`} className="font-semibold text-foreground hover:text-[#6264a7]">{room.number}</Link><div className="text-[10px] font-normal text-muted-foreground">{room.type === 'lab' ? 'Lab' : 'Event hall'}</div></th>)}
        </tr>
        <tr>
          {rooms.flatMap((room) => VISIBLE_HOUR_MARKS.map((hour) => <th key={`${room.id}-${hour}`} className="min-w-16 border-b border-r border-[#e1dfdd] bg-white px-1 py-1.5 text-center text-[10px] font-semibold text-muted-foreground dark:border-border dark:bg-card">{hour}:00</th>))}
        </tr>
      </thead>
      <tbody>
        {currentSummaries.map((summary) => (
          <tr key={summary.dateIso}>
            <th className={cn('sticky left-0 z-[40] min-w-24 border-b border-r border-[#e1dfdd] bg-[#faf9f8] px-3 py-2 text-center align-middle dark:border-border dark:bg-muted/30', isSameDate(summary.date, focusedDate) && 'bg-[#eef0ff] dark:bg-[#252b45]')}>
              <button type="button" className="flex min-h-14 w-full flex-col items-center justify-center" onClick={() => onSelectDate(summary.date)}>
                <span className="text-sm font-semibold text-foreground">{summary.date.getDate()}</span>
                <span className="text-[10px] font-normal text-muted-foreground">{weekdayFormatter.format(summary.date)}</span>
              </button>
            </th>
            {rooms.map((room) => <RoomTimeCells key={`${summary.dateIso}-${room.id}`} filter={monthFilter} onSelectDate={onSelectDate} room={room} summary={summary} />)}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
