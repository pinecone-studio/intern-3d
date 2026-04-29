import type { EventType, Room, ScheduleEvent } from '@/lib/types'

export type SchedulerQueryResult = {
  rooms: Room[]
  events: ScheduleEvent[]
}

export type Selection = {
  roomId: string
  dayOfWeek: number
  startSlot: number
  endSlot: number
  slotMinutes: number
}

export type SchedulerViewMode = 'week' | 'day' | 'month' | 'year'
export type MonthViewFilter = 'all' | 'class' | 'club' | 'closed'

export type DraftForm = {
  title: string
  type: EventType
  recurrence: 'weekly' | 'daily' | 'one-time'
  startTime: string
  endTime: string
  validFrom: string
  validUntil: string
  date: string
  notes: string
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
  validFrom?: string | null
  validUntil?: string | null
}

export type MonthSummary = {
  date: Date
  dateIso: string
  isCurrentMonth: boolean
  isWeekend: boolean
  occurrences: Array<{ event: ScheduleEvent; room: Room | null }>
  counts: Record<'class' | 'club' | 'closed', number>
  totalCount: number
  hasConflict: boolean
}
