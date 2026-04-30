import type { DeviceAssignmentRow, RoomRow, ScheduleBlockRow, ScheduleOverrideRow, ScheduleRow } from '@/db/schema'
import { getRealtimeRoomState } from '@/lib/timeline-status'
import { isEventType, type Device, type EventType, type Room, type ScheduleEvent } from '@/lib/types'

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

export function mapScheduleRow(schedule: ScheduleRow, instructor?: string): ScheduleEvent | null {
  const daysOfWeek = parseDaysOfWeek(schedule.daysOfWeek)
  const type = toScheduleEventType(schedule.type)
  if (!type) return null

  return {
    id: schedule.id,
    roomId: schedule.roomId,
    title: schedule.title,
    type,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    dayOfWeek: daysOfWeek[0] ?? 0,
    daysOfWeek,
    isOverride: false,
    instructor: schedule.instructor ?? instructor,
    notes: schedule.notes ?? undefined,
    validFrom: schedule.startDate,
    validUntil: schedule.endDate,
  }
}

export function mapScheduleOverrideRow(override: ScheduleOverrideRow, instructor?: string): ScheduleEvent | null {
  const dayOfWeek = isoDayFromDate(override.date)
  const type = toScheduleEventType(override.type)
  if (!type) return null

  return {
    id: override.id,
    roomId: override.roomId,
    title: override.title,
    type,
    startTime: override.startTime,
    endTime: override.endTime,
    dayOfWeek,
    daysOfWeek: [dayOfWeek],
    date: override.date,
    isOverride: true,
    instructor: override.instructor ?? instructor,
    notes: override.notes ?? undefined,
  }
}

function toScheduleEventType(type: string): EventType | null {
  if (type === 'open' || type === 'open_lab') return null
  if (type === 'event' || type === 'closed') return 'event'
  return isEventType(type) ? type : null
}

function daysForBlock(block: ScheduleBlockRow): number[] {
  if (block.recurrence === 'daily') return [1, 2, 3, 4, 5]
  if (block.recurrence === 'one_time' && block.specificDate) return [isoDayFromDate(block.specificDate)]
  return parseDaysOfWeek(block.daysOfWeek ?? '[]')
}

export function mapScheduleBlockRow(block: ScheduleBlockRow, instructor?: string): ScheduleEvent | null {
  const daysOfWeek = daysForBlock(block)
  const isOverride = block.recurrence === 'one_time'
  const startMinute = block.startMinute ?? block.startHour * 60
  const endMinute = block.endMinute ?? block.endHour * 60
  const type = toScheduleEventType(block.type)
  if (!type) return null

  return {
    id: block.id,
    roomId: block.roomId,
    title: block.title,
    type,
    startTime: minutesToTime(startMinute),
    endTime: minutesToTime(endMinute),
    dayOfWeek: daysOfWeek[0] ?? 0,
    daysOfWeek,
    date: isOverride ? block.specificDate ?? block.validFrom : undefined,
    isOverride,
    instructor: block.organizer ?? instructor,
    notes: block.description ?? undefined,
    validFrom: isOverride ? undefined : block.validFrom,
    validUntil: isOverride ? undefined : block.validUntil ?? undefined,
  }
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
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
  const displayName = room.name === 'Event hall' && room.floor === 4 ? 'Event hall 4' : room.name

  return {
    id: room.id,
    number: displayName,
    floor: room.floor as Room['floor'],
    type: (room.type === 'event_hall' ? 'event-hall' : room.type) as Room['type'],
    ...getRealtimeRoomState(events, now),
    devices,
  }
}
