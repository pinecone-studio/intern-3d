import type { RoomStatus, ScheduleEvent } from '@/lib/types'

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function toIsoDay(date: Date): number {
  const day = date.getDay()
  return day === 0 ? 7 : day
}

function getPriority(type: ScheduleEvent['type']): number {
  switch (type) {
    case 'closed':
      return 4
    case 'class':
      return 3
    case 'club':
      return 2
    case 'openlab':
      return 1
    default:
      return 0
  }
}

function isRecurringEventActive(event: ScheduleEvent, currentDate: string, currentDay: number, currentMinutes: number): boolean {
  if (event.isOverride) return false
  if (!event.daysOfWeek.includes(currentDay)) return false
  if (event.validFrom && currentDate < event.validFrom) return false
  if (event.validUntil && currentDate > event.validUntil) return false

  const start = timeToMinutes(event.startTime)
  const end = timeToMinutes(event.endTime)
  return currentMinutes >= start && currentMinutes < end
}

function isOverrideEventActive(event: ScheduleEvent, currentDate: string, currentMinutes: number): boolean {
  if (!event.isOverride || !event.date || event.date !== currentDate) return false

  const start = timeToMinutes(event.startTime)
  const end = timeToMinutes(event.endTime)
  return currentMinutes >= start && currentMinutes < end
}

export function getRoomStatusFromEvent(event: ScheduleEvent | null): RoomStatus {
  if (!event) return 'available'
  if (event.type === 'openlab') return 'available'
  return event.type
}

export function getCurrentEvent(events: ScheduleEvent[], now = new Date()): ScheduleEvent | null {
  const currentDate = now.toISOString().slice(0, 10)
  const currentDay = toIsoDay(now)
  const currentMinutes = now.getHours() * 60 + now.getMinutes()

  const activeOverride = events
    .filter(event => isOverrideEventActive(event, currentDate, currentMinutes))
    .sort((left, right) => {
      const priority = getPriority(right.type) - getPriority(left.type)
      if (priority !== 0) return priority
      return timeToMinutes(left.startTime) - timeToMinutes(right.startTime)
    })[0]

  if (activeOverride) return activeOverride

  return (
    events
      .filter(event => isRecurringEventActive(event, currentDate, currentDay, currentMinutes))
      .sort((left, right) => {
        const priority = getPriority(right.type) - getPriority(left.type)
        if (priority !== 0) return priority
        return timeToMinutes(left.startTime) - timeToMinutes(right.startTime)
      })[0] ?? null
  )
}

function nextOccurrenceStart(event: ScheduleEvent, now: Date): Date | null {
  const nowTime = now.getTime()

  if (event.isOverride) {
    if (!event.date) return null
    const startsAt = new Date(`${event.date}T${event.startTime}:00`)
    return startsAt.getTime() > nowTime ? startsAt : null
  }

  for (let offset = 0; offset <= 7; offset += 1) {
    const candidate = new Date(now)
    candidate.setHours(0, 0, 0, 0)
    candidate.setDate(candidate.getDate() + offset)

    const dateString = candidate.toISOString().slice(0, 10)
    const day = toIsoDay(candidate)
    if (!event.daysOfWeek.includes(day)) continue
    if (event.validFrom && dateString < event.validFrom) continue
    if (event.validUntil && dateString > event.validUntil) continue

    const startsAt = new Date(`${dateString}T${event.startTime}:00`)
    if (startsAt.getTime() > nowTime) return startsAt
  }

  return null
}

export function getNextEvent(events: ScheduleEvent[], now = new Date()): ScheduleEvent | null {
  const candidates = events
    .map(event => ({ event, startsAt: nextOccurrenceStart(event, now) }))
    .filter((candidate): candidate is { event: ScheduleEvent; startsAt: Date } => candidate.startsAt !== null)
    .sort((left, right) => {
      const byStart = left.startsAt.getTime() - right.startsAt.getTime()
      if (byStart !== 0) return byStart
      if (left.event.isOverride !== right.event.isOverride) return left.event.isOverride ? -1 : 1
      return getPriority(right.event.type) - getPriority(left.event.type)
    })

  return candidates[0]?.event ?? null
}
