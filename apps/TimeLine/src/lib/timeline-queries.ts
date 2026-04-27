import { and, asc, eq, inArray, like } from 'drizzle-orm'
import { getDrizzleDb } from '@/db/client'
import { deviceAssignmentsTable, roomsTable, scheduleBlocksTable, scheduleOverridesTable, schedulesTable } from '@/db/schema'
import { mapDeviceAssignmentRow, mapRoomRow, mapScheduleBlockRow, mapScheduleOverrideRow, mapScheduleRow } from '@/lib/timeline-mappers'
import type { ScheduleEvent } from '@/lib/types'

function matchesInstructor(event: ScheduleEvent, instructor: string): boolean {
  return event.instructor?.toLowerCase().includes(instructor.toLowerCase()) ?? false
}

async function listMappedEventsForRooms(roomIds: string[]) {
  const db = getDrizzleDb()

  try {
    const blocks = await db
      .select()
      .from(scheduleBlocksTable)
      .where(inArray(scheduleBlocksTable.roomId, roomIds))
      .orderBy(asc(scheduleBlocksTable.roomId), asc(scheduleBlocksTable.startHour))

    return blocks
      .filter(block => block.isActive === 1)
      .map(block => mapScheduleBlockRow(block))
  } catch {
    const [schedules, overrides] = await Promise.all([
      db.select().from(schedulesTable).where(inArray(schedulesTable.roomId, roomIds)).orderBy(asc(schedulesTable.startTime)),
      db.select().from(scheduleOverridesTable).where(inArray(scheduleOverridesTable.roomId, roomIds)).orderBy(asc(scheduleOverridesTable.startTime)),
    ])

    return [
      ...schedules.map((schedule) => mapScheduleRow(schedule)),
      ...overrides.map((override) => mapScheduleOverrideRow(override)),
    ]
  }
}

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

  if (rooms.length === 0) return []

  const roomIds = rooms.map((room) => room.id)
  const [devices, mappedEvents] = await Promise.all([
    db.select().from(deviceAssignmentsTable).where(inArray(deviceAssignmentsTable.roomId, roomIds)).orderBy(asc(deviceAssignmentsTable.deviceName)),
    listMappedEventsForRooms(roomIds),
  ])

  const mappedRooms = rooms.map((room) => {
    const mappedDevices = devices
      .filter((device) => device.roomId === room.id)
      .map((device) => mapDeviceAssignmentRow(device, room.name))

    return mapRoomRow(
      room,
      mappedEvents.filter((event) => event.roomId === room.id),
      mappedDevices
    )
  })

  return params.status ? mappedRooms.filter((room) => room.status === params.status) : mappedRooms
}

export async function getRoomDetail(roomId: string) {
  const db = getDrizzleDb()
  const [room] = await db.select().from(roomsTable).where(eq(roomsTable.id, roomId)).limit(1)
  if (!room) return null

  const [devices, mappedEvents] = await Promise.all([
    db.select().from(deviceAssignmentsTable).where(eq(deviceAssignmentsTable.roomId, roomId)).orderBy(asc(deviceAssignmentsTable.deviceName)),
    listMappedEventsForRooms([roomId]),
  ])
  const mappedDevices = devices.map((device) => mapDeviceAssignmentRow(device, room.name))

  return {
    room: mapRoomRow(room, mappedEvents, mappedDevices),
    events: mappedEvents,
  }
}

export async function listScheduleEvents(params: { roomId?: string | null; dayOfWeek?: string | null; instructor?: string | null } = {}) {
  const db = getDrizzleDb()

  try {
    const blockFilters = []

    if (params.roomId) blockFilters.push(eq(scheduleBlocksTable.roomId, params.roomId))

    const blocks = await db
      .select()
      .from(scheduleBlocksTable)
      .where(blockFilters.length > 0 ? and(...blockFilters) : undefined)
      .orderBy(asc(scheduleBlocksTable.roomId), asc(scheduleBlocksTable.startHour))

    const blockEvents = blocks
      .filter(block => block.isActive === 1)
      .map(block => mapScheduleBlockRow(block))
      .sort((left, right) => {
        if (left.roomId !== right.roomId) return left.roomId.localeCompare(right.roomId)
        return left.startTime.localeCompare(right.startTime)
      })

    const filteredByInstructor = params.instructor ? blockEvents.filter(event => matchesInstructor(event, params.instructor ?? '')) : blockEvents
    if (!params.dayOfWeek) return filteredByInstructor

    const day = Number(params.dayOfWeek)
    return filteredByInstructor.filter((event) => event.daysOfWeek.includes(day))
  } catch {
    // Older local/D1 databases use schedules + overrides until migration 0004 is applied.
  }

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

  const events = [
    ...schedules.map((schedule) => mapScheduleRow(schedule)),
    ...overrides.map((override) => mapScheduleOverrideRow(override)),
  ].sort((left, right) => {
    if (left.roomId !== right.roomId) return left.roomId.localeCompare(right.roomId)
    return left.startTime.localeCompare(right.startTime)
  })

  const filteredByInstructor = params.instructor ? events.filter((event) => matchesInstructor(event, params.instructor ?? '')) : events
  if (!params.dayOfWeek) return filteredByInstructor

  const day = Number(params.dayOfWeek)
  return filteredByInstructor.filter((event) => event.daysOfWeek.includes(day))
}
