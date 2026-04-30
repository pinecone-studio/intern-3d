import { WORK_DAYS } from '@/app/dashboard/_lib/scheduler-constants'
import { addDays, getDayOfWeekValue, isSameMonth, toIsoDate } from '@/app/dashboard/_lib/scheduler-date-utils'
import type { MonthSummary, TimelineCounts, TimelineOccurrence } from '@/app/dashboard/_lib/scheduler-types'
import type { EventType, Room, ScheduleEvent } from '@/lib/types'

export function eventOccursInWeekOnDay(event: ScheduleEvent, dayOfWeek: number, dayDate: string): boolean {
  return event.isOverride ? event.date === dayDate : event.daysOfWeek.includes(dayOfWeek) && (!event.validFrom || event.validFrom <= dayDate) && (!event.validUntil || event.validUntil >= dayDate)
}

export function getEventTone(type: EventType) {
  if (type === 'class') return 'border-l-[#2564cf] bg-[#dfe9ff] text-[#163760]'
  if (type === 'club') return 'border-l-[#7f5ccf] bg-[#f0e9ff] text-[#3b2468]'
  return 'border-l-[#c4314b] bg-[#fde7e9] text-[#7c2030]'
}

export function getEventLabel(type: EventType) {
  if (type === 'class') return 'Хичээл'
  if (type === 'club') return 'Клуб'
  return 'Event'
}

function formatIsoDateShort(date?: string | null) {
  if (!date) return ''
  const [, month, day] = date.split('-')
  if (!month || !day) return date
  return `${Number(month)}/${Number(day)}`
}

export function getEventDateRangeLabel(event: ScheduleEvent) {
  if (event.isOverride) return formatIsoDateShort(event.date) || 'Нэг өдөр'
  const start = formatIsoDateShort(event.validFrom)
  const end = formatIsoDateShort(event.validUntil)
  if (start && end) return `${start}-${end}`
  if (start) return `${start}-`
  if (end) return `-${end}`
  return 'Хугацаа заагаагүй'
}

export function shouldRenderTimelineEvent(event: ScheduleEvent) {
  return event.type === 'class' || event.type === 'club' || event.type === 'event'
}

export function createEmptyTimelineCounts(): TimelineCounts {
  return { class: 0, club: 0, event: 0 }
}

export function getMonthViewOccurrencesForDate(events: ScheduleEvent[], scopedRoomIds: Set<string>, roomLookup: Map<string, Room>, date: Date): TimelineOccurrence[] {
  const dayOfWeek = getDayOfWeekValue(date)
  const dateIso = toIsoDate(date)
  return events.filter((event) => scopedRoomIds.has(event.roomId) && eventOccursInWeekOnDay(event, dayOfWeek, dateIso)).sort((left, right) => left.startTime.localeCompare(right.startTime)).map((event) => ({ event, room: roomLookup.get(event.roomId) ?? null }))
}

function eventsOverlapInSameRoom(left: ScheduleEvent, right: ScheduleEvent) {
  return left.roomId === right.roomId && left.startTime < right.endTime && left.endTime > right.startTime
}

export function hasMonthViewConflict(occurrences: Array<{ event: ScheduleEvent }>) {
  return occurrences.some((occurrence, index) => occurrences.slice(index + 1).some((candidate) => eventsOverlapInSameRoom(occurrence.event, candidate.event)))
}

export function buildMonthSummaries(calendarMonth: Date, events: ScheduleEvent[], monthDays: Date[], roomLookup: Map<string, Room>, scopedRoomIds: Set<string>): MonthSummary[] {
  return monthDays.map((date) => {
    const occurrences = getMonthViewOccurrencesForDate(events, scopedRoomIds, roomLookup, date)
    const counts = occurrences.reduce<TimelineCounts>((acc, occurrence) => {
      if (occurrence.event.type === 'class' || occurrence.event.type === 'club' || occurrence.event.type === 'event') acc[occurrence.event.type] += 1
      return acc
    }, createEmptyTimelineCounts())
    return { date, dateIso: toIsoDate(date), isCurrentMonth: isSameMonth(date, calendarMonth), isWeekend: date.getDay() === 0 || date.getDay() === 6, occurrences, counts, totalCount: occurrences.length, hasConflict: hasMonthViewConflict(occurrences) }
  })
}

export function createMonthFilterTotals(monthSummaries: MonthSummary[]) {
  return monthSummaries.reduce<Record<'all' | 'class' | 'club' | 'event', number>>((acc, summary) => {
    if (!summary.isCurrentMonth) return acc
    acc.all += summary.totalCount
    acc.class += summary.counts.class
    acc.club += summary.counts.club
    acc.event += summary.counts.event
    return acc
  }, { all: 0, class: 0, club: 0, event: 0 })
}

export function getWeekDates(weekStart: Date) {
  return WORK_DAYS.map((day) => toIsoDate(addDays(weekStart, day.value - 1)))
}
