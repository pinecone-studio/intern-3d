import { DAY_MINUTES, PLANNING_END_HOUR, PLANNING_START_HOUR, SLOT_MINUTES } from '@/app/dashboard/_lib/scheduler-constants'
import type { ScheduleEvent } from '@/lib/types'

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

export function slotToTime(slot: number, slotMinutes: number): string {
  return minutesToTime(PLANNING_START_HOUR * 60 + slot * slotMinutes)
}

export function normalizeTimelineTime(time: string): string {
  const min = PLANNING_START_HOUR * 60
  const max = PLANNING_END_HOUR * 60
  const clamped = Math.min(max, Math.max(min, timeToMinutes(time)))
  return minutesToTime(Math.round(clamped / SLOT_MINUTES) * SLOT_MINUTES)
}

export function clampEventToPlanningDay(event: ScheduleEvent, slotMinutes: number = SLOT_MINUTES) {
  const start = Math.max(timeToMinutes(event.startTime), PLANNING_START_HOUR * 60)
  const end = Math.min(timeToMinutes(event.endTime), PLANNING_END_HOUR * 60)
  if (end <= start) return null
  return { left: ((start - PLANNING_START_HOUR * 60) / DAY_MINUTES) * 100, width: ((end - start) / DAY_MINUTES) * 100, slotWidth: (slotMinutes / DAY_MINUTES) * 100 }
}
