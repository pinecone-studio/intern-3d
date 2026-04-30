'use client'

import Link from 'next/link'
import { isSameDate } from '@/app/dashboard/_lib/scheduler-date-utils'
import { getEventDateRangeLabel, getEventLabel } from '@/app/dashboard/_lib/scheduler-event-utils'
import { createMonthRows, getEventMarkerTone, type MonthMatrixRow } from '@/app/dashboard/_lib/scheduler-matrix-utils'
import type { MonthSummary, MonthViewFilter } from '@/app/dashboard/_lib/scheduler-types'
import type { Room } from '@/lib/types'
import { cn } from '@/lib/utils'

type MonthMatrixColumn = { key: string; room: Room; row: MonthMatrixRow }

type SchedulerMonthTransposeTableProps = {
  currentSummaries: MonthSummary[]
  focusedDate: Date
  monthFilter: MonthViewFilter
  rooms: Room[]
  onSelectDate: (_date: Date) => void
}

const weekdayFormatter = new Intl.DateTimeFormat('mn-MN', { weekday: 'short' })

function createColumns(rooms: Room[], summaries: MonthSummary[], filter: MonthViewFilter): MonthMatrixColumn[] {
  return rooms.flatMap((room) => createMonthRows(room, summaries, filter).map((row) => ({ key: `${room.id}-${row.key}`, room, row })))
}

function CourseHeader({ column }: { column: MonthMatrixColumn }) {
  return (
    <div className="min-h-16">
      <Link href={`/dashboard/room/${column.room.id}`} className="text-[10px] font-semibold text-muted-foreground hover:text-foreground">{column.room.number}</Link>
      <div className="truncate font-semibold text-foreground" title={column.row.title}>{column.row.title}</div>
      {column.row.event ? (
        <div className="space-y-0.5">
          <div className="truncate text-[10px] text-muted-foreground">{column.row.event.startTime}-{column.row.event.endTime} · {getEventLabel(column.row.event.type)}</div>
          <div className="truncate text-[10px] text-muted-foreground">{getEventDateRangeLabel(column.row.event)}</div>
        </div>
      ) : <div className="text-[10px] text-muted-foreground">Хуваарь алга</div>}
    </div>
  )
}

function MarkCell({ column, onSelectDate, summary }: { column: MonthMatrixColumn; onSelectDate: (_date: Date) => void; summary: MonthSummary }) {
  const active = column.row.activeDates.has(summary.dateIso)
  return (
    <td className={cn('h-14 min-w-44 border-b border-r border-[#edebe9] p-1.5 text-center align-middle dark:border-border/60', isSameDate(summary.date, new Date()) && 'bg-[#fffbe8]', summary.isWeekend && 'bg-[#fafbff] dark:bg-[#161a27]')}>
      <button type="button" className="flex h-full w-full items-center justify-center rounded-md transition hover:bg-[#f8f9ff] dark:hover:bg-[#1d2131]" onClick={() => onSelectDate(summary.date)} aria-label={`${column.row.title} ${summary.dateIso}`}>
        {active && column.row.event ? <span className={cn('block h-9 w-full rounded-2xl border border-l-4 shadow-sm', getEventMarkerTone(column.row.event.type))} title={`${column.row.title} ${column.row.event.startTime}-${column.row.event.endTime} ${getEventDateRangeLabel(column.row.event)}`} /> : null}
      </button>
    </td>
  )
}

export function SchedulerMonthTransposeTable({ currentSummaries, focusedDate, monthFilter, onSelectDate, rooms }: SchedulerMonthTransposeTableProps) {
  const columns = createColumns(rooms, currentSummaries, monthFilter)

  return (
    <table className="min-w-max border-separate border-spacing-0 text-left text-xs">
      <thead className="sticky top-0 z-[60] bg-white dark:bg-card">
        <tr>
          <th className="sticky left-0 z-[70] min-w-24 border-b border-r border-[#e1dfdd] bg-white px-3 py-2 text-center text-muted-foreground dark:border-border dark:bg-card">Өдөр</th>
          {columns.map((column) => <th key={column.key} className="min-w-44 border-b border-r border-[#e1dfdd] bg-white px-3 py-2 text-muted-foreground dark:border-border dark:bg-card"><CourseHeader column={column} /></th>)}
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
            {columns.map((column) => <MarkCell key={`${summary.dateIso}-${column.key}`} column={column} summary={summary} onSelectDate={onSelectDate} />)}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
