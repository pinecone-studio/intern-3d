import type { EventType, Room, ScheduleEvent } from '@/lib/types'

export type RoomDetailQueryResult = {
  room: {
    room: Room
    events: ScheduleEvent[]
  } | null
}

export type EventFormData = {
  title: string
  type: EventType
  daysOfWeek: number[]
  startTime: string
  endTime: string
  instructor: string
  notes: string
  isOverride: boolean
  validFrom: string
  validUntil: string
  date: string
}

export type ScheduleEventMutationInput = {
  roomId: string
  title: string
  type: EventType
  startTime: string
  endTime: string
  daysOfWeek: number[]
  date?: string | null
  isOverride: boolean
  instructor?: string | null
  notes?: string | null
  validFrom?: string | null
  validUntil?: string | null
}
