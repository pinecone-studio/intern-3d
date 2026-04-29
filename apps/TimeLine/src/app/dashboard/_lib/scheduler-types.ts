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
export type TimelineOccurrence = { event: ScheduleEvent; room: Room | null }
export type TimelineCounts = Record<'class' | 'club' | 'closed', number>

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
  instructor?: string | null
  notes?: string | null
  validFrom?: string | null
  validUntil?: string | null
}

export type MonthSummary = {
  date: Date
  dateIso: string
  isCurrentMonth: boolean
  isWeekend: boolean
  occurrences: TimelineOccurrence[]
  counts: TimelineCounts
  totalCount: number
  hasConflict: boolean
}

export type YearMonthSummary = {
  monthStart: Date
  shortLabel: string
  totalCount: number
  counts: TimelineCounts
  activeDays: number
  utilization: number
  hasConflict: boolean
  conflictCount: number
  previewEvents: TimelineOccurrence[]
  timeBuckets: {
    morning: number
    afternoon: number
    evening: number
  }
  roomLoads: Array<{
    roomId: string
    roomNumber: string
    totalCount: number
  }>
}
