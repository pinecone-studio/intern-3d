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
export type MonthViewFilter = 'all' | 'class' | 'club' | 'event'
export type MatrixAxisMode = 'time-columns' | 'time-rows'
export type TimelineOccurrence = { event: ScheduleEvent; room: Room | null }
export type TimelineCounts = Record<'class' | 'club' | 'event', number>

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
  uniqueTotal: number
  uniqueCounts: TimelineCounts
  uniqueEventKeys: Record<'class' | 'club' | 'event', string[]>
  activeDays: number
  utilization: number
  hasConflict: boolean
  conflictCount: number
  previewEvents: TimelineOccurrence[]
  roomTimelines: Array<{
    roomId: string
    roomNumber: string
    totalCount: number
    hasConflict: boolean
    events: TimelineOccurrence[]
    previewEvents: TimelineOccurrence[]
  }>
  roomLoads: Array<{
    roomId: string
    roomNumber: string
    totalCount: number
    scheduledMinutes: number
    utilization: number
  }>
}

export type YearCalendarSummary = {
  uniqueTotal: number
  activeMonths: number
  classes: number
  clubs: number
  events: number
  busiestMonth: YearMonthSummary | null
  quietestMonth: YearMonthSummary | null
}
