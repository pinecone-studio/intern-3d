import { WORK_DAYS } from '@/app/dashboard/_lib/scheduler-constants'
import { addDays, getDayOfWeekValue, toIsoDate } from '@/app/dashboard/_lib/scheduler-date-utils'
import { eventOccursInWeekOnDay } from '@/app/dashboard/_lib/scheduler-event-utils'
import { timeToMinutes } from '@/app/dashboard/_lib/scheduler-time-utils'
import type { ScheduleEventMutationInput } from '@/app/dashboard/_lib/scheduler-types'
import type { Room, ScheduleEvent } from '@/lib/types'

type ConflictCandidate = ScheduleEventMutationInput & { excludeEventId?: string | null }

type ScheduleConflict = {
  dateIso: string
  roomNumber: string
  event: ScheduleEvent
}

const DEFAULT_RANGE_START = '2026-01-01'
const DEFAULT_RANGE_END = '2026-12-31'

function overlapsTime(candidate: ScheduleEventMutationInput, event: ScheduleEvent) {
  return timeToMinutes(candidate.startTime) < timeToMinutes(event.endTime) && timeToMinutes(candidate.endTime) > timeToMinutes(event.startTime)
}

function candidateOccursOnDate(candidate: ScheduleEventMutationInput, dateIso: string) {
  const dayOfWeek = getDayOfWeekValue(new Date(`${dateIso}T00:00:00`))
  if (candidate.isOverride) return candidate.date === dateIso
  return candidate.daysOfWeek.includes(dayOfWeek) && (!candidate.validFrom || candidate.validFrom <= dateIso) && (!candidate.validUntil || candidate.validUntil >= dateIso)
}

function getCandidateDate(candidate: ScheduleEventMutationInput) {
  if (candidate.isOverride && candidate.date) return candidate.date
  return candidate.validFrom ?? DEFAULT_RANGE_START
}

function getFirstRecurringConflictDate(candidate: ScheduleEventMutationInput, event: ScheduleEvent) {
  const startIso = [candidate.validFrom ?? DEFAULT_RANGE_START, event.validFrom ?? DEFAULT_RANGE_START].sort().at(-1) ?? DEFAULT_RANGE_START
  const endIso = [candidate.validUntil ?? DEFAULT_RANGE_END, event.validUntil ?? DEFAULT_RANGE_END].sort().at(0) ?? DEFAULT_RANGE_END
  let cursor = new Date(`${startIso}T00:00:00`)
  const end = new Date(`${endIso}T00:00:00`)

  while (cursor <= end) {
    const dateIso = toIsoDate(cursor)
    const day = getDayOfWeekValue(cursor)
    if (candidate.daysOfWeek.includes(day) && eventOccursInWeekOnDay(event, day, dateIso)) return dateIso
    cursor = addDays(cursor, 1)
  }

  return null
}

function getConflictDate(candidate: ScheduleEventMutationInput, event: ScheduleEvent) {
  if (candidate.isOverride) {
    const dateIso = getCandidateDate(candidate)
    return eventOccursInWeekOnDay(event, getDayOfWeekValue(new Date(`${dateIso}T00:00:00`)), dateIso) ? dateIso : null
  }

  if (event.isOverride && event.date) return candidateOccursOnDate(candidate, event.date) ? event.date : null
  return getFirstRecurringConflictDate(candidate, event)
}

export function findScheduleConflict(candidate: ConflictCandidate, events: ScheduleEvent[], rooms: Room[]): ScheduleConflict | null {
  const roomNumber = rooms.find((room) => room.id === candidate.roomId)?.number ?? candidate.roomId
  const conflict = events.find((event) => event.id !== candidate.excludeEventId && event.roomId === candidate.roomId && overlapsTime(candidate, event) && getConflictDate(candidate, event))
  if (!conflict) return null
  return { dateIso: getConflictDate(candidate, conflict) ?? getCandidateDate(candidate), roomNumber, event: conflict }
}

export function formatScheduleConflict(conflict: ScheduleConflict) {
  const day = WORK_DAYS.find((entry) => entry.value === getDayOfWeekValue(new Date(`${conflict.dateIso}T00:00:00`)))?.label ?? conflict.dateIso
  return `${conflict.dateIso} ${day}, ${conflict.roomNumber} ангид ${conflict.event.startTime}-${conflict.event.endTime} "${conflict.event.title}" хуваарьтай давхцаж байна.`
}
