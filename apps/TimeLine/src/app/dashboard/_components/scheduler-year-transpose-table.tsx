'use client'

import Link from 'next/link'
import { getEventDateRangeLabel, getEventLabel } from '@/app/dashboard/_lib/scheduler-event-utils'
import { createYearRows, getEventMarkerTone, getYearBlockSpan, type YearMatrixRow } from '@/app/dashboard/_lib/scheduler-matrix-utils'
import type { YearMonthSummary } from '@/app/dashboard/_lib/scheduler-types'
import type { Room } from '@/lib/types'
import { cn } from '@/lib/utils'

type YearMatrixColumn = { key: string; room: Room; row: YearMatrixRow }

type SchedulerYearTransposeTableProps = {
  calendarMonth: Date
  rooms: Room[]
  yearSummaries: YearMonthSummary[]
  onSelectMonth: (_date: Date) => void
}

function createColumns(rooms: Room[], summaries: YearMonthSummary[]): YearMatrixColumn[] {
  return rooms.flatMap((room) => createYearRows(room, summaries).map((row) => ({ key: `${room.id}-${row.key}`, room, row })))
}

function CourseHeader({ column }: { column: YearMatrixColumn }) {
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

function YearCell({ column, monthIndex, onSelectMonth, summary, summaries }: { column: YearMatrixColumn; monthIndex: number; onSelectMonth: (_date: Date) => void; summary: YearMonthSummary; summaries: YearMonthSummary[] }) {
  const span = getYearBlockSpan(column.row, summaries)
  const active = Boolean(span && monthIndex >= span.start && monthIndex <= span.end && column.row.event)
  return (
    <td className="h-14 min-w-44 border-b border-r border-[#edebe9] p-1.5 text-center align-middle dark:border-border/60">
      <button type="button" className="flex h-full w-full items-center justify-center rounded-md transition hover:bg-[#f8f9ff] dark:hover:bg-[#1d2131]" onClick={() => onSelectMonth(summary.monthStart)} aria-label={`${column.row.title} ${summary.shortLabel}`}>
        {active && column.row.event ? <span className={cn('block h-9 w-full rounded-2xl border border-l-4 shadow-sm', getEventMarkerTone(column.row.event.type))} title={`${column.row.title} ${column.row.event.startTime}-${column.row.event.endTime} ${getEventDateRangeLabel(column.row.event)}`} /> : null}
      </button>
    </td>
  )
}

export function SchedulerYearTransposeTable({ calendarMonth, onSelectMonth, rooms, yearSummaries }: SchedulerYearTransposeTableProps) {
  const columns = createColumns(rooms, yearSummaries)

  return (
    <table className="min-w-max border-separate border-spacing-0 text-left text-xs">
      <thead className="sticky top-0 z-[60] bg-white dark:bg-card">
        <tr>
          <th className="sticky left-0 z-[70] min-w-28 border-b border-r border-[#e1dfdd] bg-white px-3 py-2 text-center text-muted-foreground dark:border-border dark:bg-card">Сар</th>
          {columns.map((column) => <th key={column.key} className="min-w-44 border-b border-r border-[#e1dfdd] bg-white px-3 py-2 text-muted-foreground dark:border-border dark:bg-card"><CourseHeader column={column} /></th>)}
        </tr>
      </thead>
      <tbody>
        {yearSummaries.map((summary, monthIndex) => (
          <tr key={summary.monthStart.toISOString()}>
            <th className={cn('sticky left-0 z-[40] min-w-28 border-b border-r border-[#e1dfdd] bg-[#faf9f8] px-3 py-2 text-center align-middle dark:border-border dark:bg-muted/30', summary.monthStart.getMonth() === calendarMonth.getMonth() && 'bg-[#eef0ff] dark:bg-[#252b45]')}>
              <button type="button" className="flex min-h-14 w-full flex-col items-center justify-center" onClick={() => onSelectMonth(summary.monthStart)}>
                <span className="text-sm font-semibold text-foreground">{summary.shortLabel}</span>
                <span className="text-[10px] font-normal text-muted-foreground">{summary.activeDays} өдөр</span>
              </button>
            </th>
            {columns.map((column) => <YearCell key={`${summary.monthStart.toISOString()}-${column.key}`} column={column} monthIndex={monthIndex} summary={summary} summaries={yearSummaries} onSelectMonth={onSelectMonth} />)}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
