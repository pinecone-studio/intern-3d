import { sql } from 'drizzle-orm'
import { getDrizzleDb } from '@/db/client'
import { deviceAssignmentsTable, roomsTable, scheduleOverridesTable, schedulesTable, usersTable } from '@/db/schema'
import { seedDeviceAssignments, seedOverrides, seedRooms, seedSchedules, seedUsers } from '@/lib/timeline-seed-fixtures'

const INSERT_CHUNK_SIZE = 8

async function insertChunks<T>(values: T[], insertChunk: (_chunk: T[]) => Promise<unknown>) {
  for (let index = 0; index < values.length; index += INSERT_CHUNK_SIZE) {
    await insertChunk(values.slice(index, index + INSERT_CHUNK_SIZE))
  }
}

export async function seedTimelineDatabase(options: { reset?: boolean } = {}) {
  const db = getDrizzleDb()
  const users = seedUsers
  const rooms = seedRooms
  const schedules = seedSchedules
  const overrides = seedOverrides
  const devices = seedDeviceAssignments

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
