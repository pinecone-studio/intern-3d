import { and, asc, eq, inArray, like } from 'drizzle-orm'
import { getDrizzleDb } from '@/db/client'
import { devicesTable, roomsTable, scheduleEventsTable } from '@/db/schema'
import { mapDeviceRow, mapEventRow, mapRoomRow } from '@/lib/timeline-mappers'

export async function listRooms(params: { floor?: string | null; status?: string | null; search?: string | null } = {}) {
  const db = getDrizzleDb()
  const filters = []

  if (params.floor) filters.push(eq(roomsTable.floor, Number(params.floor)))
  if (params.status) filters.push(eq(roomsTable.status, params.status))
  if (params.search) filters.push(like(roomsTable.number, `%${params.search}%`))

  const rooms = await db
    .select()
    .from(roomsTable)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(asc(roomsTable.floor), asc(roomsTable.number))

  const roomIds = rooms.map(room => room.id)
  const [events, devices] = roomIds.length === 0
    ? [[], []]
    : await Promise.all([
        db.select().from(scheduleEventsTable).where(inArray(scheduleEventsTable.roomId, roomIds)).orderBy(asc(scheduleEventsTable.startTime)),
        db.select().from(devicesTable).where(inArray(devicesTable.roomId, roomIds)).orderBy(asc(devicesTable.name)),
      ])

  const mappedEvents = events.map(mapEventRow)
  const mappedDevices = devices.map(mapDeviceRow)

  return rooms.map(room =>
    mapRoomRow(
      room,
      mappedEvents.filter(event => event.roomId === room.id),
      mappedDevices.filter(device => device.roomId === room.id)
    )
  )
}

export async function getRoomDetail(roomId: string) {
  const db = getDrizzleDb()
  const [room] = await db.select().from(roomsTable).where(eq(roomsTable.id, roomId)).limit(1)
  if (!room) return null

  const [events, devices] = await Promise.all([
    db.select().from(scheduleEventsTable).where(eq(scheduleEventsTable.roomId, roomId)).orderBy(asc(scheduleEventsTable.startTime)),
    db.select().from(devicesTable).where(eq(devicesTable.roomId, roomId)).orderBy(asc(devicesTable.name)),
  ])

  const mappedEvents = events.map(mapEventRow)
  const mappedDevices = devices.map(mapDeviceRow)

  return {
    room: mapRoomRow(room, mappedEvents, mappedDevices),
    events: mappedEvents,
  }
}

export async function listScheduleEvents(params: { roomId?: string | null; dayOfWeek?: string | null; instructor?: string | null } = {}) {
  const db = getDrizzleDb()
  const filters = []

  if (params.roomId) filters.push(eq(scheduleEventsTable.roomId, params.roomId))
  if (params.instructor) filters.push(like(scheduleEventsTable.instructor, `%${params.instructor}%`))
  if (params.dayOfWeek) filters.push(like(scheduleEventsTable.daysOfWeek, `%${params.dayOfWeek}%`))

  const events = await db
    .select()
    .from(scheduleEventsTable)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(asc(scheduleEventsTable.roomId), asc(scheduleEventsTable.startTime))

  return events.map(mapEventRow)
}
