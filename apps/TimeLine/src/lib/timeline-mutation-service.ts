import { eq } from 'drizzle-orm'
import { getDrizzleDb } from '@/db/client'
import { scheduleBlocksTable, scheduleOverridesTable, schedulesTable } from '@/db/schema'
import { getRoomDetail } from '@/lib/timeline-queries'
import { requireScheduleEditorId } from '@/lib/timeline-mutation-auth'
import {
  createEventId,
  shouldSaveAsOverride,
  toOverrideInsert,
  toScheduleBlockInsert,
  toScheduleInsert,
} from '@/lib/timeline-mutation-transforms'
import type { ScheduleEventInput } from '@/lib/timeline-mutation-types'
import { isEventType } from '@/lib/types'

function assertAllowedScheduleType(input: ScheduleEventInput) {
  if (!isEventType(input.type)) {
    throw new Error('Хуваарийн төрөл зөвхөн class, club, event байх ёстой.')
  }
}

export async function createScheduleEvent(input: ScheduleEventInput, actorUserId: string | null) {
  assertAllowedScheduleType(input)

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
  assertAllowedScheduleType(input)

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
