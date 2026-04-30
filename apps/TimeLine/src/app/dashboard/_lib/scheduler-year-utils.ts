import { DAY_MINUTES } from '@/app/dashboard/_lib/scheduler-constants'
import { formatMonthShortLabel, getMonthDaysInMonth, toIsoDate } from '@/app/dashboard/_lib/scheduler-date-utils'
import { getMonthViewOccurrencesForDate, hasMonthViewConflict } from '@/app/dashboard/_lib/scheduler-event-utils'
import { timeToMinutes } from '@/app/dashboard/_lib/scheduler-time-utils'
import type { MonthViewFilter, TimelineCounts, TimelineOccurrence, YearCalendarSummary, YearMonthSummary } from '@/app/dashboard/_lib/scheduler-types'
import type { EventType, Room, ScheduleEvent } from '@/lib/types'

function createEmptyTimelineCounts(): TimelineCounts {
  return { class: 0, club: 0, event: 0 }
}

function getEventDurationMinutes(event: ScheduleEvent) {
  return Math.max(0, timeToMinutes(event.endTime) - timeToMinutes(event.startTime))
}

function getUniqueEventKey(event: ScheduleEvent) {
  return `${event.type}:${event.title.trim().toLowerCase() || event.id}`
}

function createUniqueEventKeySets(): Record<EventType, Set<string>> {
  return { class: new Set<string>(), club: new Set<string>(), event: new Set<string>() }
}

function getUniqueCounts(uniqueEventKeys: Record<EventType, Set<string>>): TimelineCounts {
  return {
    class: uniqueEventKeys.class.size,
    club: uniqueEventKeys.club.size,
    event: uniqueEventKeys.event.size,
  }
}

function toUniqueEventKeyArrays(uniqueEventKeys: Record<EventType, Set<string>>): Record<EventType, string[]> {
  return {
    class: Array.from(uniqueEventKeys.class),
    club: Array.from(uniqueEventKeys.club),
    event: Array.from(uniqueEventKeys.event),
  }
}

export function buildYearSummaries(params: {
  yearMonths: Date[]
  events: ScheduleEvent[]
  roomLookup: Map<string, Room>
  roomsForFocusedView: Room[]
  scopedRoomIds: Set<string>
  yearFilter: MonthViewFilter
}): YearMonthSummary[] {
  const { yearMonths, events, roomLookup, roomsForFocusedView, scopedRoomIds, yearFilter } = params

  return yearMonths.map((monthStart) => {
    const classroomRooms = roomsForFocusedView.filter((room) => room.type === 'lab')
    const classroomRoomIds = new Set(classroomRooms.map((room) => room.id))
    const monthDaySummaries = getMonthDaysInMonth(monthStart).map((date) => {
      const occurrences = getMonthViewOccurrencesForDate(events, scopedRoomIds, roomLookup, date)
      const filteredOccurrences = yearFilter === 'all' ? occurrences : occurrences.filter((occurrence) => occurrence.event.type === yearFilter)
      const counts = filteredOccurrences.reduce<TimelineCounts>((accumulator, occurrence) => {
        accumulator[occurrence.event.type] += 1
        return accumulator
      }, createEmptyTimelineCounts())

      return { date, dateIso: toIsoDate(date), isCurrentMonth: true, isWeekend: date.getDay() === 0 || date.getDay() === 6, occurrences: filteredOccurrences, counts, totalCount: filteredOccurrences.length, hasConflict: hasMonthViewConflict(filteredOccurrences) }
    })

    const counts = monthDaySummaries.reduce<TimelineCounts>((accumulator, summary) => ({
      class: accumulator.class + summary.counts.class,
      club: accumulator.club + summary.counts.club,
      event: accumulator.event + summary.counts.event,
    }), createEmptyTimelineCounts())
    const totalCount = monthDaySummaries.reduce((accumulator, summary) => accumulator + summary.totalCount, 0)
    const activeDays = monthDaySummaries.filter((summary) => summary.totalCount > 0).length
    const hasConflict = monthDaySummaries.some((summary) => summary.hasConflict)
    const conflictCount = monthDaySummaries.filter((summary) => summary.hasConflict).length
    const totalScheduledMinutes = monthDaySummaries.reduce((accumulator, summary) => accumulator + summary.occurrences.reduce((sum, occurrence) => {
      return classroomRoomIds.has(occurrence.event.roomId) ? sum + getEventDurationMinutes(occurrence.event) : sum
    }, 0), 0)
    const maxPossibleMinutes = classroomRooms.length * monthDaySummaries.length * DAY_MINUTES
    const utilization = maxPossibleMinutes > 0 ? Math.min(100, Math.round((totalScheduledMinutes / maxPossibleMinutes) * 100)) : 0
    const previewMap = new Map<string, TimelineOccurrence>()
    const uniqueEventKeys = createUniqueEventKeySets()
    const roomMaxMinutes = monthDaySummaries.length * DAY_MINUTES
    const roomTimelineMap = new Map<string, { roomId: string; roomNumber: string; totalCount: number; hasConflict: boolean; events: TimelineOccurrence[]; previewEvents: TimelineOccurrence[] }>(
      roomsForFocusedView.map((room) => [room.id, { roomId: room.id, roomNumber: room.number, totalCount: 0, hasConflict: false, events: [], previewEvents: [] }] as const),
    )
    const roomLoadMap = new Map<string, { roomId: string; roomNumber: string; totalCount: number; scheduledMinutes: number }>(
      classroomRooms.map((room) => [room.id, { roomId: room.id, roomNumber: room.number, totalCount: 0, scheduledMinutes: 0 }] as const),
    )

    monthDaySummaries.forEach((summary) => {
      roomTimelineMap.forEach((timeline, roomId) => {
        if (hasMonthViewConflict(summary.occurrences.filter((occurrence) => occurrence.event.roomId === roomId))) timeline.hasConflict = true
      })
      summary.occurrences.forEach((occurrence) => {
        const key = `${occurrence.event.id}-${occurrence.room?.id ?? occurrence.event.roomId}`
        if (!previewMap.has(key)) previewMap.set(key, occurrence)
        uniqueEventKeys[occurrence.event.type].add(getUniqueEventKey(occurrence.event))

        const roomId = occurrence.room?.id ?? occurrence.event.roomId
        const timeline = roomTimelineMap.get(roomId)
        if (timeline) {
          timeline.totalCount += 1
          if (!timeline.events.some((preview) => preview.event.id === occurrence.event.id)) timeline.events.push(occurrence)
          if (timeline.previewEvents.length < 3 && !timeline.previewEvents.some((preview) => preview.event.id === occurrence.event.id)) timeline.previewEvents.push(occurrence)
        }
        if (!classroomRoomIds.has(roomId)) return
        const roomNumber = occurrence.room?.number ?? occurrence.event.roomId
        const current = roomLoadMap.get(roomId)
        roomLoadMap.set(roomId, {
          roomId,
          roomNumber,
          totalCount: (current?.totalCount ?? 0) + 1,
          scheduledMinutes: (current?.scheduledMinutes ?? 0) + getEventDurationMinutes(occurrence.event),
        })
      })
    })
    const uniqueCounts = getUniqueCounts(uniqueEventKeys)

    return {
      monthStart,
      shortLabel: formatMonthShortLabel(monthStart),
      totalCount,
      counts,
      uniqueTotal: uniqueCounts.class + uniqueCounts.club + uniqueCounts.event,
      uniqueCounts,
      uniqueEventKeys: toUniqueEventKeyArrays(uniqueEventKeys),
      activeDays,
      utilization,
      hasConflict,
      conflictCount,
      previewEvents: Array.from(previewMap.values()).slice(0, 3),
      roomTimelines: Array.from(roomTimelineMap.values()),
      roomLoads: Array.from(roomLoadMap.values())
        .map((load) => ({ ...load, utilization: roomMaxMinutes > 0 ? Math.min(100, Math.round((load.scheduledMinutes / roomMaxMinutes) * 100)) : 0 }))
        .sort((left, right) => right.utilization - left.utilization || right.totalCount - left.totalCount || left.roomNumber.localeCompare(right.roomNumber, 'mn', { numeric: true })),
    }
  })
}

export function createYearFilterTotals(yearSummaries: YearMonthSummary[]) {
  const keys = { all: new Set<string>(), class: new Set<string>(), club: new Set<string>(), event: new Set<string>() }
  yearSummaries.forEach((summary) => {
    summary.uniqueEventKeys.class.forEach((key) => { keys.class.add(key); keys.all.add(key) })
    summary.uniqueEventKeys.club.forEach((key) => { keys.club.add(key); keys.all.add(key) })
    summary.uniqueEventKeys.event.forEach((key) => { keys.event.add(key); keys.all.add(key) })
  })
  return { all: keys.all.size, class: keys.class.size, club: keys.club.size, event: keys.event.size }
}

export function createYearCalendarSummary(yearSummaries: YearMonthSummary[]): YearCalendarSummary {
  const totals = createYearFilterTotals(yearSummaries)
  const busiestMonth = yearSummaries.reduce<YearMonthSummary | null>((current, summary) => (!current || summary.utilization > current.utilization ? summary : current), null)
  const quietestMonth = yearSummaries.reduce<YearMonthSummary | null>((current, summary) => (!current || summary.utilization < current.utilization ? summary : current), null)
  return { uniqueTotal: totals.all, activeMonths: yearSummaries.filter((summary) => summary.totalCount > 0).length, classes: totals.class, clubs: totals.club, events: totals.event, busiestMonth, quietestMonth }
}
