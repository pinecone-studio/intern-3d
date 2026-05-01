'use client'

import Link from 'next/link'
import type { MatrixAxisMode, MonthViewFilter, YearMonthSummary } from '@/app/dashboard/_lib/scheduler-types'
import { getEventDateRangeLabel } from '@/app/dashboard/_lib/scheduler-event-utils'
import { createYearRows, getEventMarkerTone, getYearBlockSpan, type YearMatrixRow } from '@/app/dashboard/_lib/scheduler-matrix-utils'
import { SchedulerMatrixAxisToggle } from '@/app/dashboard/_components/scheduler-matrix-axis-toggle'
import { SchedulerYearTransposeTable } from '@/app/dashboard/_components/scheduler-year-transpose-table'
import type { Room, ScheduleEvent } from '@/lib/types'
import { cn } from '@/lib/utils'

type SchedulerYearOverviewViewProps = {
  calendarMonth: Date
  matrixAxisMode: MatrixAxisMode
  rooms: Room[]
  selectedRoomView: Room | null
  yearFilter: MonthViewFilter
  yearFilterTotals: Record<MonthViewFilter, number>
  yearSummaries: YearMonthSummary[]
  onAxisModeChange: (_mode: MatrixAxisMode) => void
  onFilterChange: (_filter: MonthViewFilter) => void
  onSelectMonth: (_date: Date) => void
}

const filterOptions: Array<{ key: MonthViewFilter; label: string }> = [
  { key: 'all', label: 'Бүгд' },
  { key: 'class', label: 'Хичээл' },
  { key: 'club', label: 'Клуб' },
  { key: 'event', label: 'Event' },
]
const yearTypeOptions: Array<{ label: string; type: ScheduleEvent['type'] }> = [
  { type: 'class', label: 'Хичээл' },
  { type: 'club', label: 'Клуб' },
  { type: 'event', label: 'Event' },
]

function getVisibleYearTypes(filter: MonthViewFilter) {
  return filter === 'all' ? yearTypeOptions : yearTypeOptions.filter((option) => option.type === filter)
}

function YearTypeBlockCell({ onSelectMonth, rows, summaries }: { onSelectMonth: (_date: Date) => void; rows: YearMatrixRow[]; summaries: YearMonthSummary[] }) {
  const height = Math.max(58, rows.length * 42 + 14)
  return (
    <td colSpan={summaries.length} className="border-b border-r border-[#edebe9] p-0 align-middle dark:border-border/60" style={{ height }}>
      <div className="relative" style={{ height }}>
        <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${summaries.length}, minmax(0, 1fr))` }}>
          {summaries.map((summary) => <button key={summary.monthStart.toISOString()} type="button" className="border-r border-[#edebe9] transition hover:bg-[#f8f9ff] last:border-r-0 dark:border-border/60 dark:hover:bg-[#1d2131]" onClick={() => onSelectMonth(summary.monthStart)} aria-label={summary.shortLabel} />)}
        </div>
        {rows.map((row, index) => {
          const span = getYearBlockSpan(row, summaries)
          if (!span || !row.event) return null
          return (
            <div key={row.key} className="pointer-events-none absolute px-1" style={{ left: `${(span.start / summaries.length) * 100}%`, top: 7 + index * 42, width: `${(((span.end - span.start) + 1) / summaries.length) * 100}%` }}>
              <div className={cn('h-9 overflow-hidden rounded-md border border-l-4 px-1.5 py-0.5 text-[10px] font-semibold leading-tight shadow-sm', getEventMarkerTone(row.event.type))} title={`${row.title} ${row.event.startTime}-${row.event.endTime} ${getEventDateRangeLabel(row.event)}`}>
                <div className="truncate">{row.title}</div>
                <div className="truncate font-medium opacity-75">{row.event.startTime}-{row.event.endTime} · {getEventDateRangeLabel(row.event)}</div>
              </div>
            </div>
          )
        })}
      </div>
    </td>
  )
}

export function SchedulerYearOverviewView({ calendarMonth, matrixAxisMode, onAxisModeChange, onFilterChange, onSelectMonth, rooms, selectedRoomView, yearFilter, yearFilterTotals, yearSummaries }: SchedulerYearOverviewViewProps) {
  return (
    <div className="flex h-[calc(100vh-190px)] min-h-[520px] flex-col bg-white dark:bg-card">
      <div className="shrink-0 border-b border-[#e1dfdd] bg-white px-4 py-3 dark:border-border dark:bg-card">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div><p className="text-sm font-semibold text-foreground">{calendarMonth.getFullYear()} оны matrix</p><p className="text-xs text-muted-foreground">{selectedRoomView ? `${selectedRoomView.number} ангийн жилийн matrix` : 'Бүх ангийн жилийн matrix'}</p></div><div className="flex flex-wrap items-center gap-2"><SchedulerMatrixAxisToggle mode={matrixAxisMode} onModeChange={onAxisModeChange} timeColumnLabel="Сар багана" timeRowLabel="Сар мөр" />{filterOptions.map((option) => <button key={option.key} type="button" className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition', yearFilter === option.key ? 'border-[#6264a7] bg-[#eef0ff] text-[#323769] dark:border-[#8f93ff] dark:bg-[#252b45] dark:text-white' : 'border-[#d9dbea] bg-white text-muted-foreground hover:border-[#bec2e5] hover:text-foreground dark:border-[#30364d] dark:bg-[#171b27] dark:hover:text-white')} onClick={() => onFilterChange(option.key)}><span>{option.label}</span><span className="rounded-full bg-black/5 px-1.5 py-0.5 text-[10px] dark:bg-white/10">{yearFilterTotals[option.key]}</span></button>)}</div></div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
      {matrixAxisMode === 'time-rows' ? <SchedulerYearTransposeTable calendarMonth={calendarMonth} onSelectMonth={onSelectMonth} rooms={rooms} yearFilter={yearFilter} yearSummaries={yearSummaries} /> : (
      <table className="w-full min-w-[1040px] border-separate border-spacing-0 text-left text-xs">
        <colgroup><col className="w-24" /><col className="w-44" />{yearSummaries.map((summary) => <col key={summary.monthStart.toISOString()} style={{ width: `calc((100% - 17rem) / ${yearSummaries.length})` }} />)}</colgroup>
        <thead className="sticky top-0 z-[60] bg-white dark:bg-card"><tr><th className="sticky left-0 z-[70] min-w-24 border-b border-r border-[#e1dfdd] bg-white px-3 py-2 text-center text-muted-foreground dark:border-border dark:bg-card">Анги</th><th className="sticky left-24 z-[70] min-w-44 border-b border-r border-[#e1dfdd] bg-white px-3 py-2 text-muted-foreground dark:border-border dark:bg-card">Төрөл</th>{yearSummaries.map((summary) => <th key={summary.monthStart.toISOString()} className={cn('min-w-16 border-b border-r border-[#e1dfdd] bg-white px-1 py-2 text-center font-semibold text-foreground dark:border-border dark:bg-card', summary.monthStart.getMonth() === calendarMonth.getMonth() && 'bg-[#eef0ff] dark:bg-[#252b45]')}><button type="button" onClick={() => onSelectMonth(summary.monthStart)}><div>{summary.shortLabel}</div><div className="text-[10px] font-normal text-muted-foreground">{summary.activeDays} өдөр</div></button></th>)}</tr></thead>
        <tbody>{rooms.map((room) => {
          const roomRows = createYearRows(room, yearSummaries)
          const visibleTypes = getVisibleYearTypes(yearFilter)
          return visibleTypes.map((option, optionIndex) => {
            const typeRows = roomRows.filter((row) => row.event?.type === option.type)
            return <tr key={`${room.id}-${option.type}`}>{optionIndex === 0 ? <th rowSpan={visibleTypes.length} className="sticky left-0 z-[40] min-w-24 border-b border-r border-[#e1dfdd] bg-[#faf9f8] px-3 py-2 text-center align-middle dark:border-border dark:bg-muted/30"><Link href={`/dashboard/room/${room.id}`} className="flex min-h-14 flex-col items-center justify-center"><span className="block text-sm font-semibold text-foreground">{room.number}</span><span className="text-[10px] font-normal text-muted-foreground">{room.type === 'lab' ? 'Lab' : 'Event hall'}</span></Link></th> : null}<td className={cn('sticky left-24 z-[35] min-w-44 border-b border-r border-[#e1dfdd] bg-white px-3 py-2 align-middle font-semibold text-foreground dark:border-border dark:bg-card', typeRows.some((row) => row.hasConflict) && 'bg-[#fff4ce]')}><div>{option.label}</div><div className="text-[10px] font-normal text-muted-foreground">{typeRows.length} хуваарь</div></td><YearTypeBlockCell onSelectMonth={onSelectMonth} rows={typeRows} summaries={yearSummaries} /></tr>
          })
        })}</tbody>
      </table>
      )}
      </div>
    </div>
  )
}
