import { getFallbackRoomDetail, listFallbackRooms, listFallbackScheduleEvents } from '@/lib/timeline-fallback'
import type { Room, ScheduleEvent, User } from './types'

// Keep a small mock surface for UI/demo pages.
// These records mirror real IDs and shapes used by timeline DB seed/query flows.
export const scheduleEvents: ScheduleEvent[] = listFallbackScheduleEvents()

export function createRooms(): Room[] {
  return listFallbackRooms()
}

export const demoUsers: Record<string, User> = {
  admin: {
    id: 'admin-1',
    name: 'Ariun Admin',
    role: 'admin',
    assignedDevice: null,
  },
  student: {
    id: 'student-1',
    name: 'Maya Student',
    role: 'student',
    assignedDevice: {
      id: 'room-301-device-1',
      name: 'iMac-01',
      roomId: 'room-301',
      roomNumber: '301',
      status: 'assigned',
      assignedTo: 'student-1',
    },
  },
}

export function getEventsForRoom(roomId: string): ScheduleEvent[] {
  return listFallbackScheduleEvents({ roomId })
}

export function getEventsForDay(dayOfWeek: number): ScheduleEvent[] {
  return listFallbackScheduleEvents({ dayOfWeek: String(dayOfWeek) })
}

export function getRoomById(roomId: string): Room | undefined {
  return getFallbackRoomDetail(roomId)?.room
}

export function getEventsForInstructor(instructorName: string): ScheduleEvent[] {
  return scheduleEvents.filter((event) => event.instructor?.includes(instructorName) || event.instructor === instructorName)
}

export function getAllRooms(): Room[] {
  return listFallbackRooms()
}
