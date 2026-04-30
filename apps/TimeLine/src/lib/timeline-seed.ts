import { sql } from 'drizzle-orm'
import { getDrizzleDb } from '@/db/client'
import { deviceAssignmentsTable, roomsTable, scheduleBlocksTable, scheduleOverridesTable, schedulesTable, usersTable } from '@/db/schema'
import { seedDeviceAssignments, seedOverrides, seedRooms, seedSchedules, seedUsers } from '@/lib/timeline-seed-fixtures'
import type { EventType, ScheduleEvent } from '@/lib/types'

const INSERT_CHUNK_SIZE = 8

function toBlockEventType(type: EventType): string {
  return type === 'event' ? 'event' : type
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function toStartHour(minutes: number): number {
  return Math.floor(minutes / 60)
}

function toEndHour(minutes: number): number {
  return Math.ceil(minutes / 60)
}

function toScheduleEventFromSchedule(schedule: typeof seedSchedules[number]): ScheduleEvent | null {
  const daysOfWeek = JSON.parse(schedule.daysOfWeek) as number[]
  if (schedule.type === 'open') return null

  return {
    id: schedule.id,
    roomId: schedule.roomId,
    title: schedule.title,
    type: (schedule.type === 'closed' ? 'event' : schedule.type) as EventType,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    dayOfWeek: daysOfWeek[0] ?? 0,
    daysOfWeek,
    isOverride: false,
    instructor: schedule.instructor ?? undefined,
    notes: schedule.notes ?? undefined,
    validFrom: schedule.startDate,
    validUntil: schedule.endDate,
  }
}

function toScheduleEventFromOverride(override: typeof seedOverrides[number]): ScheduleEvent | null {
  const day = new Date(`${override.date}T00:00:00`).getDay()
  const dayOfWeek = day === 0 ? 7 : day
  if (override.type === 'open') return null

  return {
    id: override.id,
    roomId: override.roomId,
    title: override.title,
    type: (override.type === 'closed' ? 'event' : override.type) as EventType,
    startTime: override.startTime,
    endTime: override.endTime,
    dayOfWeek,
    daysOfWeek: [dayOfWeek],
    date: override.date,
    isOverride: true,
    instructor: override.instructor ?? undefined,
    notes: override.notes ?? undefined,
  }
}

function toScheduleBlock(event: ScheduleEvent): typeof scheduleBlocksTable.$inferInsert {
  const isOneTime = event.isOverride || event.type === 'event' || Boolean(event.date)
  const date = event.date ?? event.validFrom ?? '2026-04-01'
  const isDaily = !isOneTime && event.daysOfWeek.length >= 5
  const startMinute = timeToMinutes(event.startTime)
  const endMinute = timeToMinutes(event.endTime)

  return {
    id: event.id,
    roomId: event.roomId,
    type: toBlockEventType(event.type),
    title: event.title,
    description: event.notes ?? null,
    organizer: event.instructor ?? null,
    startHour: toStartHour(startMinute),
    endHour: toEndHour(endMinute),
    startMinute,
    endMinute,
    recurrence: isOneTime ? 'one_time' : isDaily ? 'daily' : 'weekly',
    specificDate: isOneTime ? date : null,
    daysOfWeek: !isOneTime && !isDaily ? JSON.stringify(event.daysOfWeek) : null,
    validFrom: isOneTime ? date : event.validFrom ?? '2026-04-01',
    validUntil: isOneTime ? date : event.validUntil ?? '2026-12-31',
    isActive: 1,
    createdBy: 'admin-1',
    createdAt: event.validFrom ?? '2026-04-01T00:00:00.000Z',
    updatedAt: event.validFrom ?? '2026-04-01T00:00:00.000Z',
  }
}

function getScheduleBlocks(): Array<typeof scheduleBlocksTable.$inferInsert> {
  return [
    ...seedSchedules.map(toScheduleEventFromSchedule),
    ...seedOverrides.map(toScheduleEventFromOverride),
  ].filter((event): event is ScheduleEvent => event !== null).map(toScheduleBlock)
}

async function insertChunks<T>(values: T[], insertChunk: (_chunk: T[]) => Promise<unknown>) {
  for (let index = 0; index < values.length; index += INSERT_CHUNK_SIZE) {
    await insertChunk(values.slice(index, index + INSERT_CHUNK_SIZE))
  }
}

export async function seedTimelineDatabase(options: { reset?: boolean } = {}) {
  const db = getDrizzleDb()
  const users = seedUsers
  const rooms = seedRooms
  const schedules = seedSchedules.filter(schedule => schedule.type !== 'open')
  const overrides = seedOverrides
  const scheduleBlocks = getScheduleBlocks()
  const devices = seedDeviceAssignments

  if (options.reset) {
    await db.delete(deviceAssignmentsTable)
    try {
      await db.delete(scheduleBlocksTable)
    } catch {
      // Older local/D1 databases use schedules + overrides until migration 0004 is applied.
    }
    await db.delete(scheduleOverridesTable)
    await db.delete(schedulesTable)
    await db.delete(roomsTable)
    await db.delete(usersTable)
  }

  const existingRooms = await db.select({ count: sql<number>`count(*)` }).from(roomsTable)
  if ((existingRooms[0]?.count ?? 0) > 0 && !options.reset) {
    return { seeded: false, reason: 'rooms already exist' as const }
  }

  await insertChunks(users, chunk => db.insert(usersTable).values(chunk))
  await insertChunks(rooms, chunk => db.insert(roomsTable).values(chunk))
  await insertChunks(schedules, chunk => db.insert(schedulesTable).values(chunk))
  await insertChunks(overrides, chunk => db.insert(scheduleOverridesTable).values(chunk))
  try {
    await insertChunks(scheduleBlocks, chunk => db.insert(scheduleBlocksTable).values(chunk))
  } catch {
    // Older local/D1 databases use schedules + overrides until migration 0004 is applied.
  }
  await insertChunks(devices, chunk => db.insert(deviceAssignmentsTable).values(chunk))

  return {
    seeded: true,
    users: users.length,
    rooms: rooms.length,
    events: scheduleBlocks.length,
    devices: devices.length,
  }
}
