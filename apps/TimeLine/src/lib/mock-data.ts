import { getFallbackRoomDetail, listFallbackRooms, listFallbackScheduleEvents } from '@/lib/timeline-fallback'
import type { Room, ScheduleEvent } from './types'

// Keep a small mock surface for UI/demo pages.
// These records mirror real IDs and shapes used by timeline DB seed/query flows.
export const scheduleEvents: ScheduleEvent[] = listFallbackScheduleEvents()

export function createRooms(): Room[] {
  return listFallbackRooms()
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
