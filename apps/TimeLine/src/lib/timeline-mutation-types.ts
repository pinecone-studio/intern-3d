import type { EventType } from '@/lib/types'

export const DEFAULT_VALID_FROM = '2026-04-01'
export const DEFAULT_VALID_UNTIL = '2026-12-31'

export type ScheduleEventInput = {
  roomId: string
  title: string
  type: EventType
  startTime: string
  endTime: string
  daysOfWeek: number[]
  date?: string | null
  isOverride?: boolean | null
  instructor?: string | null
  notes?: string | null
  validFrom?: string | null
  validUntil?: string | null
}
