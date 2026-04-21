import type { DeviceRow, RoomRow, ScheduleEventRow } from '@/db/schema'
import type { Device, EventType, Room, RoomStatus, ScheduleEvent } from '@/lib/types'

const DEMO_DAY = 2
const DEMO_TIME_MINUTES = 10 * 60 + 30

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export function mapEventRow(event: ScheduleEventRow): ScheduleEvent {
  const daysOfWeek = JSON.parse(event.daysOfWeek) as number[]

  return {
    id: event.id,
    roomId: event.roomId,
    title: event.title,
    type: event.type as EventType,
    startTime: event.startTime,
    endTime: event.endTime,
    dayOfWeek: event.dayOfWeek ?? daysOfWeek[0] ?? 0,
    daysOfWeek,
    date: event.date ?? undefined,
    isOverride: Boolean(event.isOverride),
    instructor: event.instructor ?? undefined,
    notes: event.notes ?? undefined,
    validFrom: event.validFrom ?? undefined,
    validUntil: event.validUntil ?? undefined,
  }
}

export function mapDeviceRow(device: DeviceRow): Device {
  return {
    id: device.id,
    name: device.name,
    roomId: device.roomId,
    roomNumber: device.roomNumber,
    status: device.status as Device['status'],
    assignedTo: device.assignedTo ?? undefined,
  }
}

function findCurrentEvent(events: ScheduleEvent[], roomId: string): ScheduleEvent | null {
  const roomEvents = events.filter(event => event.roomId === roomId && event.daysOfWeek.includes(DEMO_DAY))
  return roomEvents.find(event => DEMO_TIME_MINUTES >= timeToMinutes(event.startTime) && DEMO_TIME_MINUTES < timeToMinutes(event.endTime)) ?? null
}

function findNextEvent(events: ScheduleEvent[], roomId: string): ScheduleEvent | null {
  return (
    events
      .filter(event => event.roomId === roomId && event.daysOfWeek.includes(DEMO_DAY))
      .filter(event => timeToMinutes(event.startTime) > DEMO_TIME_MINUTES)
      .sort((left, right) => timeToMinutes(left.startTime) - timeToMinutes(right.startTime))[0] ?? null
  )
}

export function mapRoomRow(room: RoomRow, events: ScheduleEvent[], devices: Device[]): Room {
  return {
    id: room.id,
    number: room.number,
    floor: room.floor as Room['floor'],
    type: room.type as Room['type'],
    status: room.status as RoomStatus,
    currentEvent: findCurrentEvent(events, room.id),
    nextEvent: findNextEvent(events, room.id),
    devices,
  }
}
