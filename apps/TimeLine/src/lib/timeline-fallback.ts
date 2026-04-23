import { fallbackDevices, fallbackOverrides, fallbackRooms, fallbackSchedules } from '@/lib/timeline-fallback-data'
import { mapDeviceAssignmentRow, mapRoomRow, mapScheduleOverrideRow, mapScheduleRow } from '@/lib/timeline-mappers'

const fallbackUserNames: Record<string, string> = {
  'admin-1': 'Ariun Admin',
}

function getFallbackUserName(userId: string): string | undefined {
  return fallbackUserNames[userId]
}

function matchesInstructor(instructor: string | undefined, search: string): boolean {
  return instructor?.toLowerCase().includes(search.toLowerCase()) ?? false
}

function buildFallback(now = new Date()) {
  const events = [
    ...fallbackSchedules.map(schedule => mapScheduleRow(schedule, getFallbackUserName(schedule.createdBy))),
    ...fallbackOverrides.map(override => mapScheduleOverrideRow(override, getFallbackUserName(override.createdBy))),
  ].sort((left, right) => {
    if (left.roomId !== right.roomId) return left.roomId.localeCompare(right.roomId)
    return left.startTime.localeCompare(right.startTime)
  })

  const rooms = [...fallbackRooms]
    .sort((left, right) => {
      if (left.floor !== right.floor) return left.floor - right.floor
      return left.name.localeCompare(right.name)
    })
    .map((room) => {
      const devices = fallbackDevices
        .filter((device) => device.roomId === room.id)
        .map((device) => mapDeviceAssignmentRow(device, room.name))

      return mapRoomRow(
        room,
        events.filter((event) => event.roomId === room.id),
        devices,
        now
      )
    })

  return { rooms, events }
}

export function listFallbackRooms(params: { floor?: string | null; status?: string | null; search?: string | null } = {}) {
  const { rooms } = buildFallback()

  return rooms.filter((room) => {
    if (params.floor && room.floor !== Number(params.floor)) return false
    if (params.status && room.status !== params.status) return false
    if (params.search && !room.number.toLowerCase().includes(params.search.toLowerCase())) return false
    return true
  })
}

export function getFallbackRoomDetail(roomId: string) {
  const { rooms, events } = buildFallback()
  const room = rooms.find((entry) => entry.id === roomId)
  if (!room) return null

  return {
    room,
    events: events.filter((event) => event.roomId === roomId),
  }
}

export function listFallbackScheduleEvents(params: { roomId?: string | null; dayOfWeek?: string | null; instructor?: string | null } = {}) {
  const { events } = buildFallback()

  return events.filter((event) => {
    if (params.roomId && event.roomId !== params.roomId) return false
    if (params.dayOfWeek && !event.daysOfWeek.includes(Number(params.dayOfWeek))) return false
    if (params.instructor && !matchesInstructor(event.instructor, params.instructor)) return false
    return true
  })
}
