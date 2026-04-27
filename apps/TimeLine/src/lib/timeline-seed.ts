import { sql } from 'drizzle-orm'
import { getDrizzleDb } from '@/db/client'
import { deviceAssignmentsTable, roomsTable, scheduleOverridesTable, schedulesTable, usersTable } from '@/db/schema'
import { demoUsers } from '@/lib/demo-users'
import { createRooms, scheduleEvents } from '@/lib/mock-data'
import type { EventType, Room, ScheduleEvent } from '@/lib/types'

const ADMIN_USER_ID = 'admin-1'
const EVENT_HALL_CAPACITY = 80
const DEFAULT_START_DATE = '2026-04-01'
const DEFAULT_END_DATE = '2026-06-15'
const INSERT_CHUNK_SIZE = 8
const missingMockRooms: Room[] = [
  {
    id: 'room-hall-3',
    number: 'Event hall 3',
    floor: 3,
    type: 'event-hall',
    status: 'available',
    currentEvent: null,
    nextEvent: null,
    devices: [],
  },
]

function getMockRooms(): Room[] {
  const rooms = createRooms()
  const roomIds = new Set(rooms.map(room => room.id))
  return [...rooms, ...missingMockRooms.filter(room => !roomIds.has(room.id))]
}

function toDatabaseRoomType(type: Room['type']): string {
  return type === 'event-hall' ? 'event_hall' : type
}

function toDatabaseEventType(type: EventType): string {
  return type === 'openlab' ? 'open' : type
}

function shouldCreateOverride(event: ScheduleEvent): boolean {
  return event.isOverride || event.type === 'closed' || Boolean(event.date)
}

function getUsers(now: string): Array<typeof usersTable.$inferInsert> {
  return Object.values(demoUsers).map(user => ({
    id: user.id,
    name: user.name,
    email: `${user.id}@school.local`,
    role: user.role,
    createdAt: now,
  }))
}

function getRooms(now: string): Array<typeof roomsTable.$inferInsert> {
  return getMockRooms().map(room => ({
    id: room.id,
    name: room.number,
    floor: room.floor,
    type: toDatabaseRoomType(room.type),
    capacity: room.type === 'event-hall' ? EVENT_HALL_CAPACITY : room.devices.length,
    createdAt: now,
  }))
}

function toSchedule(event: ScheduleEvent, now: string): typeof schedulesTable.$inferInsert {
  return {
    id: event.id,
    roomId: event.roomId,
    title: event.title,
    type: toDatabaseEventType(event.type),
    daysOfWeek: JSON.stringify(event.daysOfWeek),
    startTime: event.startTime,
    endTime: event.endTime,
    startDate: event.validFrom ?? DEFAULT_START_DATE,
    endDate: event.validUntil ?? DEFAULT_END_DATE,
    createdBy: ADMIN_USER_ID,
    createdAt: now,
  }
}

function toOverride(event: ScheduleEvent, now: string): typeof scheduleOverridesTable.$inferInsert {
  return {
    id: event.id,
    roomId: event.roomId,
    date: event.date ?? event.validFrom ?? DEFAULT_START_DATE,
    startTime: event.startTime,
    endTime: event.endTime,
    type: toDatabaseEventType(event.type),
    title: event.title,
    createdBy: ADMIN_USER_ID,
    createdAt: now,
  }
}

function getSchedules(now: string): Array<typeof schedulesTable.$inferInsert> {
  return scheduleEvents.filter(event => !shouldCreateOverride(event)).map(event => toSchedule(event, now))
}

function getOverrides(now: string): Array<typeof scheduleOverridesTable.$inferInsert> {
  return scheduleEvents.filter(shouldCreateOverride).map(event => toOverride(event, now))
}

function getAssignedUserId(deviceId: string): string | null {
  const user = Object.values(demoUsers).find(demoUser => demoUser.assignedDevice?.id === deviceId)
  return user?.id ?? null
}

function getDevices(): Array<typeof deviceAssignmentsTable.$inferInsert> {
  return getMockRooms().flatMap(room =>
    room.devices.map(device => ({
      id: device.id,
      roomId: device.roomId,
      deviceName: device.name,
      userId: getAssignedUserId(device.id),
    }))
  )
}

async function insertChunks<T>(values: T[], insertChunk: (_chunk: T[]) => Promise<unknown>) {
  for (let index = 0; index < values.length; index += INSERT_CHUNK_SIZE) {
    await insertChunk(values.slice(index, index + INSERT_CHUNK_SIZE))
  }
}

export async function seedTimelineDatabase(options: { reset?: boolean } = {}) {
  const db = getDrizzleDb()
  const now = new Date().toISOString()
  const users = getUsers(now)
  const rooms = getRooms(now)
  const schedules = getSchedules(now)
  const overrides = getOverrides(now)
  const devices = getDevices()

  if (options.reset) {
    await db.delete(deviceAssignmentsTable)
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
  await insertChunks(devices, chunk => db.insert(deviceAssignmentsTable).values(chunk))

  return {
    seeded: true,
    users: users.length,
    rooms: rooms.length,
    events: schedules.length + overrides.length,
    devices: devices.length,
  }
}
