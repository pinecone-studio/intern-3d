export const EVENT_TYPES = ['class', 'club', 'event'] as const
export const OPEN_LAB_STATUS = 'open_lab'
export const ROOM_STATUSES = [OPEN_LAB_STATUS, ...EVENT_TYPES] as const

export type EventType = typeof EVENT_TYPES[number]
export type RoomStatus = typeof ROOM_STATUSES[number]

export function isEventType(value: string): value is EventType {
  return EVENT_TYPES.includes(value as EventType)
}

export function isRoomStatus(value: string): value is RoomStatus {
  return ROOM_STATUSES.includes(value as RoomStatus)
}

export type Room = {
  id: string
  number: string
  floor: 3 | 4
  type: 'lab' | 'event-hall'
  status: RoomStatus
  currentEvent: ScheduleEvent | null
  nextEvent: ScheduleEvent | null
  devices: Device[]
}

export type ScheduleEvent = {
  id: string
  roomId: string
  title: string
  groupId?: string
  type: EventType
  startTime: string
  endTime: string
  dayOfWeek: number // For display/filtering, derived from daysOfWeek[0] for recurring
  daysOfWeek: number[] // Multiple days for recurring schedules (e.g., [1, 3, 5] for Mon, Wed, Fri)
  date?: string // For one-time overrides
  isOverride: boolean
  instructor?: string
  notes?: string
  // Recurring schedule validity period
  validFrom?: string // ISO date string (e.g., "2026-05-01")
  validUntil?: string // ISO date string (e.g., "2026-06-30")
}

export type Device = {
  id: string
  name: string
  roomId: string
  roomNumber: string
  status: 'available' | 'assigned' | 'maintenance'
  assignedTo?: string | null
}

export type UserRole = 'admin' | 'student'

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
}
