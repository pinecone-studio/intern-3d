import { WORK_DAYS } from '@/app/dashboard/_lib/scheduler-constants'
import { addDays, getDayOfWeekValue, isSameMonth, toIsoDate } from '@/app/dashboard/_lib/scheduler-date-utils'
import type { MonthSummary } from '@/app/dashboard/_lib/scheduler-types'
import type { EventType, Room, ScheduleEvent } from '@/lib/types'

export function eventOccursInWeekOnDay(event: ScheduleEvent, dayOfWeek: number, dayDate: string): boolean {
  return event.isOverride ? event.date === dayDate : event.daysOfWeek.includes(dayOfWeek) && (!event.validFrom || event.validFrom <= dayDate) && (!event.validUntil || event.validUntil >= dayDate)
}

export function getEventTone(type: EventType) {
  if (type === 'class') return 'border-l-[#2564cf] bg-[#dfe9ff] text-[#163760]'
  if (type === 'club') return 'border-l-[#7f5ccf] bg-[#f0e9ff] text-[#3b2468]'
  if (type === 'closed') return 'border-l-[#d83b01] bg-[#fff0eb] text-[#672100]'
  return 'border-l-[#0f8f5f] bg-[#e8fff5] text-[#0f5132]'
}

export function getEventLabel(type: EventType) {
  if (type === 'class') return 'Class'
  if (type === 'club') return 'Club'
  if (type === 'closed') return 'Event'
  return 'Open lab'
}

export function shouldRenderTimelineEvent(event: ScheduleEvent) {
  return event.type === 'class' || event.type === 'club' || event.type === 'closed'
}

function getMonthViewOccurrencesForDate(events: ScheduleEvent[], scopedRoomIds: Set<string>, roomLookup: Map<string, Room>, date: Date) {
  const dayOfWeek = getDayOfWeekValue(date)
  const dateIso = toIsoDate(date)
  return events.filter((event) => scopedRoomIds.has(event.roomId) && eventOccursInWeekOnDay(event, dayOfWeek, dateIso)).sort((left, right) => left.startTime.localeCompare(right.startTime)).map((event) => ({ event, room: roomLookup.get(event.roomId) ?? null }))
}

function hasMonthViewConflict(occurrences: Array<{ event: ScheduleEvent }>) {
  return occurrences.some((occurrence, index) => occurrences.slice(index + 1).some((candidate) => occurrence.event.startTime < candidate.event.endTime && occurrence.event.endTime > candidate.event.startTime))
}

export function buildMonthSummaries(calendarMonth: Date, events: ScheduleEvent[], monthDays: Date[], roomLookup: Map<string, Room>, scopedRoomIds: Set<string>): MonthSummary[] {
  return monthDays.map((date) => {
    const occurrences = getMonthViewOccurrencesForDate(events, scopedRoomIds, roomLookup, date)
    const counts = occurrences.reduce<Record<'class' | 'club' | 'closed', number>>((acc, occurrence) => {
      if (occurrence.event.type === 'class' || occurrence.event.type === 'club' || occurrence.event.type === 'closed') acc[occurrence.event.type] += 1
      return acc
    }, { class: 0, club: 0, closed: 0 })
    return { date, dateIso: toIsoDate(date), isCurrentMonth: isSameMonth(date, calendarMonth), isWeekend: date.getDay() === 0 || date.getDay() === 6, occurrences, counts, totalCount: occurrences.length, hasConflict: hasMonthViewConflict(occurrences) }
  })
}

export function createMonthFilterTotals(monthSummaries: MonthSummary[]) {
  return monthSummaries.reduce<Record<'all' | 'class' | 'club' | 'closed', number>>((acc, summary) => {
    if (!summary.isCurrentMonth) return acc
    acc.all += summary.totalCount
    acc.class += summary.counts.class
    acc.club += summary.counts.club
    acc.closed += summary.counts.closed
    return acc
  }, { all: 0, class: 0, club: 0, closed: 0 })
}

export function getWeekDates(weekStart: Date) {
  return WORK_DAYS.map((day) => toIsoDate(addDays(weekStart, day.value - 1)))
}
