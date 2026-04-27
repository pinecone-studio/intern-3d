import type { DeviceAssignmentRow, RoomRow, ScheduleBlockRow, ScheduleOverrideRow, ScheduleRow } from '@/db/schema'
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

export function mapScheduleRow(schedule: ScheduleRow, instructor?: string): ScheduleEvent {
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
    instructor: schedule.instructor ?? instructor,
    notes: schedule.notes ?? undefined,
    validFrom: schedule.startDate,
    validUntil: schedule.endDate,
  }
}

export function mapScheduleOverrideRow(override: ScheduleOverrideRow, instructor?: string): ScheduleEvent {
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
    instructor: override.instructor ?? instructor,
    notes: override.notes ?? undefined,
  }
}

function toBlockEventType(type: string): EventType {
  if (type === 'open_lab') return 'openlab'
  if (type === 'event') return 'closed'
  return type as EventType
}

function daysForBlock(block: ScheduleBlockRow): number[] {
  if (block.recurrence === 'daily') return [1, 2, 3, 4, 5]
  if (block.recurrence === 'one_time' && block.specificDate) return [isoDayFromDate(block.specificDate)]
  return parseDaysOfWeek(block.daysOfWeek ?? '[]')
}

export function mapScheduleBlockRow(block: ScheduleBlockRow, instructor?: string): ScheduleEvent {
  const daysOfWeek = daysForBlock(block)
  const isOverride = block.recurrence === 'one_time'

  return {
    id: block.id,
    roomId: block.roomId,
    title: block.title,
    type: toBlockEventType(block.type),
    startTime: `${String(block.startHour).padStart(2, '0')}:00`,
    endTime: `${String(block.endHour).padStart(2, '0')}:00`,
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
