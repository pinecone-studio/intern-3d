import { and, asc, eq, inArray, like } from 'drizzle-orm'
import { getDrizzleDb } from '@/db/client'
import { deviceAssignmentsTable, roomsTable, scheduleOverridesTable, schedulesTable } from '@/db/schema'
import { mapDeviceAssignmentRow, mapRoomRow, mapScheduleOverrideRow, mapScheduleRow } from '@/lib/timeline-mappers'

export async function listRooms(params: { floor?: string | null; status?: string | null; search?: string | null } = {}) {
  const db = getDrizzleDb()
  const filters = []

  if (params.floor) filters.push(eq(roomsTable.floor, Number(params.floor)))
  if (params.search) filters.push(like(roomsTable.name, `%${params.search}%`))

  const rooms = await db
    .select()
    .from(roomsTable)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(asc(roomsTable.floor), asc(roomsTable.name))

  const roomIds = rooms.map(room => room.id)
  const [schedules, overrides, devices] = roomIds.length === 0
    ? [[], [], []]
    : await Promise.all([
        db.select().from(schedulesTable).where(inArray(schedulesTable.roomId, roomIds)).orderBy(asc(schedulesTable.startTime)),
        db.select().from(scheduleOverridesTable).where(inArray(scheduleOverridesTable.roomId, roomIds)).orderBy(asc(scheduleOverridesTable.startTime)),
        db.select().from(deviceAssignmentsTable).where(inArray(deviceAssignmentsTable.roomId, roomIds)).orderBy(asc(deviceAssignmentsTable.deviceName)),
      ])

  const mappedEvents = [...schedules.map(mapScheduleRow), ...overrides.map(mapScheduleOverrideRow)]

  const mappedRooms = rooms.map(room => {
    const mappedDevices = devices
      .filter(device => device.roomId === room.id)
      .map(device => mapDeviceAssignmentRow(device, room.name))

    return mapRoomRow(
      room,
      mappedEvents.filter(event => event.roomId === room.id),
      mappedDevices
    )
  })

  return params.status ? mappedRooms.filter(room => room.status === params.status) : mappedRooms
}

export async function getRoomDetail(roomId: string) {
  const db = getDrizzleDb()
  const [room] = await db.select().from(roomsTable).where(eq(roomsTable.id, roomId)).limit(1)
  if (!room) return null

  const [schedules, overrides, devices] = await Promise.all([
    db.select().from(schedulesTable).where(eq(schedulesTable.roomId, roomId)).orderBy(asc(schedulesTable.startTime)),
    db.select().from(scheduleOverridesTable).where(eq(scheduleOverridesTable.roomId, roomId)).orderBy(asc(scheduleOverridesTable.startTime)),
    db.select().from(deviceAssignmentsTable).where(eq(deviceAssignmentsTable.roomId, roomId)).orderBy(asc(deviceAssignmentsTable.deviceName)),
  ])

  const mappedEvents = [...schedules.map(mapScheduleRow), ...overrides.map(mapScheduleOverrideRow)]
  const mappedDevices = devices.map(device => mapDeviceAssignmentRow(device, room.name))

  return {
    room: mapRoomRow(room, mappedEvents, mappedDevices),
    events: mappedEvents,
  }
}

export async function listScheduleEvents(params: { roomId?: string | null; dayOfWeek?: string | null; instructor?: string | null } = {}) {
  const db = getDrizzleDb()

  if (params.instructor) return []

  const scheduleFilters = []
  const overrideFilters = []

  if (params.roomId) {
    scheduleFilters.push(eq(schedulesTable.roomId, params.roomId))
    overrideFilters.push(eq(scheduleOverridesTable.roomId, params.roomId))
  }

  const schedules = await db
    .select()
    .from(schedulesTable)
    .where(scheduleFilters.length > 0 ? and(...scheduleFilters) : undefined)
    .orderBy(asc(schedulesTable.roomId), asc(schedulesTable.startTime))

  const overrides = await db
    .select()
    .from(scheduleOverridesTable)
    .where(overrideFilters.length > 0 ? and(...overrideFilters) : undefined)
    .orderBy(asc(scheduleOverridesTable.roomId), asc(scheduleOverridesTable.startTime))

  const events = [...schedules.map(mapScheduleRow), ...overrides.map(mapScheduleOverrideRow)].sort((left, right) => {
    if (left.roomId !== right.roomId) return left.roomId.localeCompare(right.roomId)
    return left.startTime.localeCompare(right.startTime)
  })

  if (!params.dayOfWeek) return events

  const day = Number(params.dayOfWeek)
  return events.filter(event => event.daysOfWeek.includes(day))
}
