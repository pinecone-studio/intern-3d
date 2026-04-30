import { hasMonthViewConflict } from '@/app/dashboard/_lib/scheduler-event-utils'
import type { MonthSummary, MonthViewFilter, YearMonthSummary } from '@/app/dashboard/_lib/scheduler-types'
import type { Room, ScheduleEvent } from '@/lib/types'

export type MonthMatrixRow = { activeDates: Set<string>; event: ScheduleEvent | null; hasConflict: boolean; key: string; title: string }
export type YearMatrixRow = { activeMonths: Set<string>; event: ScheduleEvent | null; hasConflict: boolean; key: string; title: string }

export function getEventMarkerTone(type: ScheduleEvent['type']) {
  if (type === 'class') return 'border-[#2564cf] bg-[#dfe9ff] text-[#17375e]'
  if (type === 'club') return 'border-[#7f5ccf] bg-[#f0e9ff] text-[#3b2468]'
  return 'border-[#c4314b] bg-[#fde7e9] text-[#7c2030]'
}

export function getMonthOccurrences(summary: MonthSummary, roomId: string, filter: MonthViewFilter) {
  return summary.occurrences.filter((occurrence) => occurrence.event.roomId === roomId && (filter === 'all' || occurrence.event.type === filter))
}

export function getEventMatrixKey(event: ScheduleEvent) {
  return JSON.stringify([
    event.roomId,
    event.type,
    event.title.trim().toLowerCase().replace(/\s+/g, ' '),
    event.startTime,
    event.endTime,
    event.isOverride ? event.date ?? '' : event.validFrom ?? '',
    event.isOverride ? event.date ?? '' : event.validUntil ?? '',
    event.isOverride ? 'override' : 'recurring',
  ])
}

export function createMonthRows(room: Room, summaries: MonthSummary[], filter: MonthViewFilter): MonthMatrixRow[] {
  const rows = new Map<string, MonthMatrixRow>()
  summaries.forEach((summary) => {
    const occurrences = getMonthOccurrences(summary, room.id, filter)
    const hasConflict = hasMonthViewConflict(occurrences)
    occurrences.forEach(({ event }) => {
      const eventKey = getEventMatrixKey(event)
      const row = rows.get(eventKey) ?? { activeDates: new Set<string>(), event, hasConflict: false, key: eventKey, title: event.title }
      row.activeDates.add(summary.dateIso)
      row.hasConflict ||= hasConflict
      rows.set(eventKey, row)
    })
  })
  const sortedRows = Array.from(rows.values()).sort((left, right) => (left.event?.startTime ?? '').localeCompare(right.event?.startTime ?? '') || left.title.localeCompare(right.title, 'mn'))
  return sortedRows.length > 0 ? sortedRows : [{ activeDates: new Set<string>(), event: null, hasConflict: false, key: `${room.id}-open`, title: room.type === 'lab' ? 'Open lab' : 'Сул' }]
}

function getRoomTimeline(summary: YearMonthSummary, roomId: string) {
  return summary.roomTimelines.find((timeline) => timeline.roomId === roomId) ?? null
}

export function createYearRows(room: Room, summaries: YearMonthSummary[]): YearMatrixRow[] {
  const rows = new Map<string, YearMatrixRow>()
  summaries.forEach((summary) => {
    const timeline = getRoomTimeline(summary, room.id)
    timeline?.events.forEach(({ event }) => {
      const eventKey = getEventMatrixKey(event)
      const row = rows.get(eventKey) ?? { activeMonths: new Set<string>(), event, hasConflict: false, key: eventKey, title: event.title }
      row.activeMonths.add(summary.monthStart.toISOString())
      row.hasConflict ||= Boolean(timeline?.hasConflict)
      rows.set(eventKey, row)
    })
  })
  const sortedRows = Array.from(rows.values()).sort((left, right) => (left.event?.startTime ?? '').localeCompare(right.event?.startTime ?? '') || left.title.localeCompare(right.title, 'mn'))
  return sortedRows.length > 0 ? sortedRows : [{ activeMonths: new Set<string>(), event: null, hasConflict: false, key: `${room.id}-open`, title: room.type === 'lab' ? 'Open lab' : 'Сул' }]
}

function parseIsoDate(date?: string | null) {
  if (!date) return null
  const [year, month, day] = date.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

export function getYearBlockSpan(row: YearMatrixRow, summaries: YearMonthSummary[]) {
  if (!row.event || summaries.length === 0) return null
  const year = summaries[0].monthStart.getFullYear()
  const fallbackIndexes = summaries.map((summary, index) => row.activeMonths.has(summary.monthStart.toISOString()) ? index : -1).filter((index) => index >= 0)
  const fallbackStart = fallbackIndexes[0] ?? 0
  const fallbackEnd = fallbackIndexes.at(-1) ?? fallbackStart
  const startDate = row.event.isOverride ? parseIsoDate(row.event.date) : parseIsoDate(row.event.validFrom)
  const endDate = row.event.isOverride ? parseIsoDate(row.event.date) : parseIsoDate(row.event.validUntil)
  const startIndex = startDate ? (startDate.getFullYear() < year ? 0 : startDate.getFullYear() > year ? summaries.length : startDate.getMonth()) : fallbackStart
  const endIndex = endDate ? (endDate.getFullYear() > year ? summaries.length - 1 : endDate.getFullYear() < year ? -1 : endDate.getMonth()) : fallbackEnd
  const clippedStart = Math.max(0, Math.min(summaries.length - 1, startIndex))
  const clippedEnd = Math.max(0, Math.min(summaries.length - 1, endIndex))
  return clippedEnd >= clippedStart ? { start: clippedStart, end: clippedEnd } : null
}
