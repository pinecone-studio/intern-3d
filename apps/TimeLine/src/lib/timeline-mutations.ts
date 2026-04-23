import { eq } from 'drizzle-orm'
import { getDrizzleDb } from '@/db/client'
import { scheduleOverridesTable, schedulesTable } from '@/db/schema'
import { getRoomDetail } from '@/lib/timeline-queries'
import type { EventType } from '@/lib/types'

const ADMIN_USER_ID = 'admin-1'
const DEFAULT_VALID_FROM = '2026-04-01'
const DEFAULT_VALID_UNTIL = '2026-12-31'

export type ScheduleEventInput = {
  roomId: string
  title: string
  type: EventType
  startTime: string
  endTime: string
  daysOfWeek: number[]
  date?: string | null
  isOverride?: boolean | null
  validFrom?: string | null
  validUntil?: string | null
}

function createEventId(): string {
  return `event-${crypto.randomUUID()}`
}

function toDatabaseEventType(type: EventType): string {
  return type === 'openlab' ? 'open' : type
}

function shouldSaveAsOverride(input: ScheduleEventInput): boolean {
  return input.isOverride || input.type === 'closed' || Boolean(input.date)
}

function getOverrideDate(input: ScheduleEventInput): string {
  return input.date || input.validFrom || DEFAULT_VALID_FROM
}

function toScheduleInsert(input: ScheduleEventInput, id: string, now: string) {
  return {
    id,
    roomId: input.roomId,
    title: input.title,
    type: toDatabaseEventType(input.type),
    daysOfWeek: JSON.stringify(input.daysOfWeek),
    startTime: input.startTime,
    endTime: input.endTime,
    startDate: input.validFrom || DEFAULT_VALID_FROM,
    endDate: input.validUntil || DEFAULT_VALID_UNTIL,
    createdBy: ADMIN_USER_ID,
    createdAt: now,
  }
}

function toOverrideInsert(input: ScheduleEventInput, id: string, now: string) {
  return {
    id,
    roomId: input.roomId,
    date: getOverrideDate(input),
    startTime: input.startTime,
    endTime: input.endTime,
    type: toDatabaseEventType(input.type),
    title: input.title,
    createdBy: ADMIN_USER_ID,
    createdAt: now,
  }
}

export async function createScheduleEvent(input: ScheduleEventInput) {
  const db = getDrizzleDb()
  const id = createEventId()
  const now = new Date().toISOString()

  if (shouldSaveAsOverride(input)) {
    await db.insert(scheduleOverridesTable).values(toOverrideInsert(input, id, now))
  } else {
    await db.insert(schedulesTable).values(toScheduleInsert(input, id, now))
  }

  return getRoomDetail(input.roomId)
}

export async function updateScheduleEvent(id: string, input: ScheduleEventInput) {
  const db = getDrizzleDb()
  const now = new Date().toISOString()
  const [existingSchedule] = await db.select().from(schedulesTable).where(eq(schedulesTable.id, id)).limit(1)
  const [existingOverride] = await db.select().from(scheduleOverridesTable).where(eq(scheduleOverridesTable.id, id)).limit(1)

  if (!existingSchedule && !existingOverride) return null

  if (shouldSaveAsOverride(input)) {
    const values = toOverrideInsert(input, id, existingOverride?.createdAt ?? now)

    if (existingSchedule) await db.delete(schedulesTable).where(eq(schedulesTable.id, id))
    if (existingOverride) await db.update(scheduleOverridesTable).set(values).where(eq(scheduleOverridesTable.id, id))
    if (!existingOverride) await db.insert(scheduleOverridesTable).values(values)
  } else {
    const values = toScheduleInsert(input, id, existingSchedule?.createdAt ?? now)

    if (existingOverride) await db.delete(scheduleOverridesTable).where(eq(scheduleOverridesTable.id, id))
    if (existingSchedule) await db.update(schedulesTable).set(values).where(eq(schedulesTable.id, id))
    if (!existingSchedule) await db.insert(schedulesTable).values(values)
  }

  return getRoomDetail(input.roomId)
}

export async function deleteScheduleEvent(id: string) {
  const db = getDrizzleDb()
  await db.delete(schedulesTable).where(eq(schedulesTable.id, id))
  await db.delete(scheduleOverridesTable).where(eq(scheduleOverridesTable.id, id))
  return true
}
