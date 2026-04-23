import { and, asc, eq, inArray, like } from 'drizzle-orm'
import { getDrizzleDb } from '@/db/client'
import { deviceAssignmentsTable, roomsTable, scheduleOverridesTable, schedulesTable, usersTable } from '@/db/schema'
import { getFallbackRoomDetail, listFallbackRooms, listFallbackScheduleEvents } from '@/lib/timeline-fallback'
import { mapDeviceAssignmentRow, mapRoomRow, mapScheduleOverrideRow, mapScheduleRow } from '@/lib/timeline-mappers'
import type { ScheduleEvent } from '@/lib/types'

const fallbackUserNames: Record<string, string> = {
  'admin-1': 'Ariun Admin',
}

function matchesInstructor(event: ScheduleEvent, instructor: string): boolean {
  return event.instructor?.toLowerCase().includes(instructor.toLowerCase()) ?? false
}

function getInstructorName(userNamesById: Map<string, string>, userId: string): string | undefined {
  return userNamesById.get(userId) ?? fallbackUserNames[userId]
}

export async function listRooms(params: { floor?: string | null; status?: string | null; search?: string | null } = {}) {
  try {
    const db = getDrizzleDb()
    const filters = []

    if (params.floor) filters.push(eq(roomsTable.floor, Number(params.floor)))
    if (params.search) filters.push(like(roomsTable.name, `%${params.search}%`))

    const rooms = await db
      .select()
      .from(roomsTable)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(asc(roomsTable.floor), asc(roomsTable.name))

    if (rooms.length === 0) return listFallbackRooms(params)

    const roomIds = rooms.map((room) => room.id)
    const [schedules, overrides, devices] = await Promise.all([
      db.select().from(schedulesTable).where(inArray(schedulesTable.roomId, roomIds)).orderBy(asc(schedulesTable.startTime)),
      db.select().from(scheduleOverridesTable).where(inArray(scheduleOverridesTable.roomId, roomIds)).orderBy(asc(scheduleOverridesTable.startTime)),
      db.select().from(deviceAssignmentsTable).where(inArray(deviceAssignmentsTable.roomId, roomIds)).orderBy(asc(deviceAssignmentsTable.deviceName)),
    ])

    const users = await db.select().from(usersTable)
    const userNamesById = new Map(users.map(user => [user.id, user.name]))

    const mappedEvents = [
      ...schedules.map(schedule => mapScheduleRow(schedule, getInstructorName(userNamesById, schedule.createdBy))),
      ...overrides.map(override => mapScheduleOverrideRow(override, getInstructorName(userNamesById, override.createdBy))),
    ]

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
  } catch {
    return listFallbackRooms(params)
  }
}

export async function getRoomDetail(roomId: string) {
  try {
    const db = getDrizzleDb()
    const [room] = await db.select().from(roomsTable).where(eq(roomsTable.id, roomId)).limit(1)
    if (!room) return getFallbackRoomDetail(roomId)

    const [schedules, overrides, devices] = await Promise.all([
      db.select().from(schedulesTable).where(eq(schedulesTable.roomId, roomId)).orderBy(asc(schedulesTable.startTime)),
      db.select().from(scheduleOverridesTable).where(eq(scheduleOverridesTable.roomId, roomId)).orderBy(asc(scheduleOverridesTable.startTime)),
      db.select().from(deviceAssignmentsTable).where(eq(deviceAssignmentsTable.roomId, roomId)).orderBy(asc(deviceAssignmentsTable.deviceName)),
    ])

    const users = await db.select().from(usersTable)
    const userNamesById = new Map(users.map(user => [user.id, user.name]))
    const mappedEvents = [
      ...schedules.map(schedule => mapScheduleRow(schedule, getInstructorName(userNamesById, schedule.createdBy))),
      ...overrides.map(override => mapScheduleOverrideRow(override, getInstructorName(userNamesById, override.createdBy))),
    ]
    const mappedDevices = devices.map((device) => mapDeviceAssignmentRow(device, room.name))

    return {
      room: mapRoomRow(room, mappedEvents, mappedDevices),
      events: mappedEvents,
    }
  } catch {
    return getFallbackRoomDetail(roomId)
  }
}

export async function listScheduleEvents(params: { roomId?: string | null; dayOfWeek?: string | null; instructor?: string | null } = {}) {
  try {
    const db = getDrizzleDb()
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

    const users = await db.select().from(usersTable)
    const userNamesById = new Map(users.map(user => [user.id, user.name]))

    const events = [
      ...schedules.map(schedule => mapScheduleRow(schedule, getInstructorName(userNamesById, schedule.createdBy))),
      ...overrides.map(override => mapScheduleOverrideRow(override, getInstructorName(userNamesById, override.createdBy))),
    ].sort((left, right) => {
      if (left.roomId !== right.roomId) return left.roomId.localeCompare(right.roomId)
      return left.startTime.localeCompare(right.startTime)
    })

    if (events.length === 0) return listFallbackScheduleEvents(params)
    const filteredByInstructor = params.instructor ? events.filter(event => matchesInstructor(event, params.instructor ?? '')) : events
    if (!params.dayOfWeek) return filteredByInstructor

    const day = Number(params.dayOfWeek)
    return filteredByInstructor.filter((event) => event.daysOfWeek.includes(day))
  } catch {
    return listFallbackScheduleEvents(params)
  }
}
