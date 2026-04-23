import type { DeviceAssignmentRow, RoomRow, ScheduleOverrideRow, ScheduleRow } from '@/db/schema'
import { getCurrentEvent, getNextEvent, getRoomStatusFromEvent } from '@/lib/timeline-status'
import type { Device, EventType, Room, ScheduleEvent } from '@/lib/types'

function parseDaysOfWeek(daysOfWeek: string): number[] {
  try {
    const parsed = JSON.parse(daysOfWeek) as unknown
    return Array.isArray(parsed) ? parsed.map(value => Number(value)).filter(value => value >= 1 && value <= 7) : []
  } catch {
    return []
  }
}

function isoDayFromDate(date: string): number {
  const day = new Date(`${date}T00:00:00`).getDay()
  return day === 0 ? 7 : day
}

export function mapScheduleRow(schedule: ScheduleRow): ScheduleEvent {
  const daysOfWeek = parseDaysOfWeek(schedule.daysOfWeek)

  return {
    id: schedule.id,
    roomId: schedule.roomId,
    title: schedule.title,
    type: (schedule.type === 'open' ? 'openlab' : schedule.type) as EventType,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    dayOfWeek: daysOfWeek[0] ?? 0,
    daysOfWeek,
    isOverride: false,
    validFrom: schedule.startDate,
    validUntil: schedule.endDate,
  }
}

export function mapScheduleOverrideRow(override: ScheduleOverrideRow): ScheduleEvent {
  const dayOfWeek = isoDayFromDate(override.date)

  return {
    id: override.id,
    roomId: override.roomId,
    title: override.title,
    type: (override.type === 'open' ? 'openlab' : override.type) as EventType,
    startTime: override.startTime,
    endTime: override.endTime,
    dayOfWeek,
    daysOfWeek: [dayOfWeek],
    date: override.date,
    isOverride: true,
  }
}

export function mapDeviceAssignmentRow(device: DeviceAssignmentRow, roomName: string): Device {
  return {
    id: device.id,
    name: device.deviceName,
    roomId: device.roomId,
    roomNumber: roomName,
    status: device.userId ? 'assigned' : 'available',
    assignedTo: device.userId ?? undefined,
  }
}

export function mapRoomRow(room: RoomRow, events: ScheduleEvent[], devices: Device[], now = new Date()): Room {
  const currentEvent = getCurrentEvent(events, now)

  return {
    id: room.id,
    number: room.name,
    floor: room.floor as Room['floor'],
    type: (room.type === 'event_hall' ? 'event-hall' : room.type) as Room['type'],
    status: getRoomStatusFromEvent(currentEvent),
    currentEvent,
    nextEvent: getNextEvent(events, now),
    devices,
  }
}
