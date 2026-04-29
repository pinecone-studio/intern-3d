import { DEFAULT_VALID_FROM, DEFAULT_VALID_UNTIL, type ScheduleEventInput } from '@/lib/timeline-mutation-types'

function toDatabaseEventType(type: ScheduleEventInput['type']): string {
  return type === 'openlab' ? 'open' : type
}

function toBlockEventType(type: ScheduleEventInput['type']): string {
  if (type === 'openlab') return 'open_lab'
  if (type === 'closed') return 'event'
  return type
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function normalizeOptionalText(value?: string | null): string | null {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

function shouldSaveAsOverride(input: ScheduleEventInput): boolean {
  return input.isOverride || input.type === 'closed' || Boolean(input.date)
}

function toRecurrence(input: ScheduleEventInput): 'one_time' | 'daily' | 'weekly' {
  if (shouldSaveAsOverride(input)) return 'one_time'
  return input.daysOfWeek.length >= 5 ? 'daily' : 'weekly'
}

function getOverrideDate(input: ScheduleEventInput): string {
  return input.date || input.validFrom || DEFAULT_VALID_FROM
}

export function createEventId(): string {
  return `event-${crypto.randomUUID()}`
}

export function toScheduleInsert(input: ScheduleEventInput, id: string, now: string, createdBy: string) {
  return {
    id,
    roomId: input.roomId,
    title: input.title,
    type: toDatabaseEventType(input.type),
    daysOfWeek: JSON.stringify(input.daysOfWeek),
    startTime: input.startTime,
    endTime: input.endTime,
    instructor: normalizeOptionalText(input.instructor),
    notes: normalizeOptionalText(input.notes),
    startDate: input.validFrom || DEFAULT_VALID_FROM,
    endDate: input.validUntil || DEFAULT_VALID_UNTIL,
    createdBy,
    createdAt: now,
  }
}

export function toOverrideInsert(input: ScheduleEventInput, id: string, now: string, createdBy: string) {
  return {
    id,
    roomId: input.roomId,
    date: getOverrideDate(input),
    startTime: input.startTime,
    endTime: input.endTime,
    type: toDatabaseEventType(input.type),
    title: input.title,
    instructor: normalizeOptionalText(input.instructor),
    notes: normalizeOptionalText(input.notes),
    createdBy,
    createdAt: now,
  }
}

export function toScheduleBlockInsert(input: ScheduleEventInput, id: string, now: string, createdBy: string) {
  const startMinute = timeToMinutes(input.startTime)
  const endMinute = timeToMinutes(input.endTime)
  const recurrence = toRecurrence(input)
  const date = getOverrideDate(input)

  return {
    id,
    roomId: input.roomId,
    cohortId: null,
    type: toBlockEventType(input.type),
    title: input.title,
    description: normalizeOptionalText(input.notes),
    color: null,
    organizer: normalizeOptionalText(input.instructor),
    startHour: Math.floor(startMinute / 60),
    endHour: Math.ceil(endMinute / 60),
    startMinute,
    endMinute,
    recurrence,
    specificDate: recurrence === 'one_time' ? date : null,
    daysOfWeek: recurrence === 'weekly' ? JSON.stringify(input.daysOfWeek) : null,
    validFrom: recurrence === 'one_time' ? date : input.validFrom || DEFAULT_VALID_FROM,
    validUntil: recurrence === 'one_time' ? date : input.validUntil || null,
    isActive: 1,
    createdBy,
    createdAt: now,
    updatedAt: now,
  }
}

export { shouldSaveAsOverride }
