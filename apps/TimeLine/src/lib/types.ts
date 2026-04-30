export type RoomStatus = 'available' | 'class' | 'club' | 'closed'

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

export type EventType = 'class' | 'club' | 'openlab' | 'closed'

export type ScheduleEvent = {
  id: string
  roomId: string
  title: string
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
