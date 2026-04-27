/* eslint-disable max-lines */
import { eq } from 'drizzle-orm'
import { getDrizzleDb } from '@/db/client'
import { scheduleBlocksTable, scheduleOverridesTable, schedulesTable, usersTable } from '@/db/schema'
import { getRoomDetail } from '@/lib/timeline-queries'
import type { EventType } from '@/lib/types'

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
  instructor?: string | null
  notes?: string | null
  validFrom?: string | null
  validUntil?: string | null
}

function createEventId(): string {
  return `event-${crypto.randomUUID()}`
}

function toDatabaseEventType(type: EventType): string {
  return type === 'openlab' ? 'open' : type
}

function toBlockEventType(type: EventType): string {
  if (type === 'openlab') return 'open_lab'
  if (type === 'closed') return 'event'
  return type
}

function toHour(time: string): number {
  return Number(time.split(':')[0])
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

function normalizeOptionalText(value?: string | null): string | null {
  const normalized = value?.trim()
  return normalized ? normalized : null
}

async function requireScheduleEditorId(actorUserId: string | null): Promise<string> {
  if (!actorUserId) {
    throw new Error('Нэвтэрсэн админ хэрэглэгч шаардлагатай байна.')
  }

  const db = getDrizzleDb()
  const [user] = await db
    .select({ id: usersTable.id, role: usersTable.role })
    .from(usersTable)
    .where(eq(usersTable.id, actorUserId))
    .limit(1)

  if (!user) {
    throw new Error('Сессийн хэрэглэгч DB дээр олдсонгүй.')
  }

  if (user.role !== 'admin') {
    throw new Error('Зөвхөн админ хэрэглэгч хуваарь өөрчилж чадна.')
  }

  return user.id
}

function toScheduleInsert(input: ScheduleEventInput, id: string, now: string, createdBy: string) {
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

function toOverrideInsert(input: ScheduleEventInput, id: string, now: string, createdBy: string) {
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

function toScheduleBlockInsert(input: ScheduleEventInput, id: string, now: string, createdBy: string) {
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
    startHour: toHour(input.startTime),
    endHour: toHour(input.endTime),
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

export async function createScheduleEvent(input: ScheduleEventInput, actorUserId: string | null) {
  const db = getDrizzleDb()
  const id = createEventId()
  const now = new Date().toISOString()
  const createdBy = await requireScheduleEditorId(actorUserId)

  try {
    await db.insert(scheduleBlocksTable).values(toScheduleBlockInsert(input, id, now, createdBy))
    return getRoomDetail(input.roomId)
  } catch {
    // Older local/D1 databases use schedules + overrides until migration 0004 is applied.
  }

  if (shouldSaveAsOverride(input)) {
    await db.insert(scheduleOverridesTable).values(toOverrideInsert(input, id, now, createdBy))
  } else {
    await db.insert(schedulesTable).values(toScheduleInsert(input, id, now, createdBy))
  }

  return getRoomDetail(input.roomId)
}

export async function updateScheduleEvent(id: string, input: ScheduleEventInput, actorUserId: string | null) {
  const db = getDrizzleDb()
  const now = new Date().toISOString()
  const createdBy = await requireScheduleEditorId(actorUserId)

  try {
    const [existingBlock] = await db.select().from(scheduleBlocksTable).where(eq(scheduleBlocksTable.id, id)).limit(1)

    if (existingBlock) {
      await db
        .update(scheduleBlocksTable)
        .set({ ...toScheduleBlockInsert(input, id, existingBlock.createdAt, createdBy), updatedAt: now })
        .where(eq(scheduleBlocksTable.id, id))

      return getRoomDetail(input.roomId)
    }
  } catch {
    // Older local/D1 databases use schedules + overrides until migration 0004 is applied.
  }

  const [existingSchedule] = await db.select().from(schedulesTable).where(eq(schedulesTable.id, id)).limit(1)
  const [existingOverride] = await db.select().from(scheduleOverridesTable).where(eq(scheduleOverridesTable.id, id)).limit(1)

  if (!existingSchedule && !existingOverride) return null

  if (shouldSaveAsOverride(input)) {
    const values = toOverrideInsert(input, id, existingOverride?.createdAt ?? now, createdBy)

    if (existingSchedule) await db.delete(schedulesTable).where(eq(schedulesTable.id, id))
    if (existingOverride) await db.update(scheduleOverridesTable).set(values).where(eq(scheduleOverridesTable.id, id))
    if (!existingOverride) await db.insert(scheduleOverridesTable).values(values)
  } else {
    const values = toScheduleInsert(input, id, existingSchedule?.createdAt ?? now, createdBy)

    if (existingOverride) await db.delete(scheduleOverridesTable).where(eq(scheduleOverridesTable.id, id))
    if (existingSchedule) await db.update(schedulesTable).set(values).where(eq(schedulesTable.id, id))
    if (!existingSchedule) await db.insert(schedulesTable).values(values)
  }

  return getRoomDetail(input.roomId)
}

export async function deleteScheduleEvent(id: string, actorUserId: string | null) {
  await requireScheduleEditorId(actorUserId)
  const db = getDrizzleDb()

  try {
    await db.delete(scheduleBlocksTable).where(eq(scheduleBlocksTable.id, id))
  } catch {
    // Older local/D1 databases use schedules + overrides until migration 0004 is applied.
  }

  await db.delete(schedulesTable).where(eq(schedulesTable.id, id))
  await db.delete(scheduleOverridesTable).where(eq(scheduleOverridesTable.id, id))
  return true
}
