import { DAY_VIEW_SLOT_MINUTES, DAY_VIEW_SLOT_COUNT, PLANNING_START_HOUR, SLOT_COUNT, SLOT_MINUTES, WORK_DAYS } from '@/app/dashboard/_lib/scheduler-constants'
import { addDays, toIsoDate } from '@/app/dashboard/_lib/scheduler-date-utils'
import { normalizeTimelineTime, slotToTime, timeToMinutes } from '@/app/dashboard/_lib/scheduler-time-utils'
import type { DraftForm, ScheduleEventMutationInput, Selection, SchedulerViewMode } from '@/app/dashboard/_lib/scheduler-types'
import type { ScheduleEvent } from '@/lib/types'

export function createDefaultForm(selection: Selection, weekStart: Date): DraftForm {
  return { title: '', type: 'class', recurrence: 'weekly', startTime: slotToTime(Math.min(selection.startSlot, selection.endSlot), selection.slotMinutes), endTime: slotToTime(Math.max(selection.startSlot, selection.endSlot) + 1, selection.slotMinutes), validFrom: toIsoDate(addDays(weekStart, selection.dayOfWeek - 1)), validUntil: '', date: toIsoDate(addDays(weekStart, selection.dayOfWeek - 1)), notes: '' }
}

export function createFormFromEvent(event: ScheduleEvent, dayOfWeek: number, weekStart: Date): DraftForm {
  const selectedDate = event.date ?? toIsoDate(addDays(weekStart, dayOfWeek - 1))
  return { title: event.title, type: event.type, recurrence: event.isOverride ? 'one-time' : event.daysOfWeek.length >= WORK_DAYS.length ? 'daily' : 'weekly', startTime: event.startTime, endTime: event.endTime, validFrom: event.validFrom ?? selectedDate, validUntil: event.validUntil ?? '', date: selectedDate, notes: event.notes ?? '' }
}

export function createSchedulerMutationInput(roomId: string, dayOfWeek: number, form: DraftForm): ScheduleEventMutationInput {
  const isOneTime = form.recurrence === 'one-time'
  const startTime = normalizeTimelineTime(form.startTime)
  const endTime = normalizeTimelineTime(form.endTime)
  return { roomId, title: form.title.trim(), type: form.type, startTime, endTime, daysOfWeek: form.recurrence === 'daily' ? WORK_DAYS.map((day) => day.value) : [dayOfWeek], date: isOneTime ? form.date : null, isOverride: isOneTime, validFrom: isOneTime ? null : form.validFrom || null, validUntil: isOneTime ? null : form.validUntil || null }
}

export function buildLocalEvent(roomId: string, dayOfWeek: number, form: DraftForm): ScheduleEvent {
  const isOneTime = form.recurrence === 'one-time'
  const startTime = normalizeTimelineTime(form.startTime)
  const endTime = normalizeTimelineTime(form.endTime)
  return { id: `local-${crypto.randomUUID()}`, roomId, title: form.title.trim(), type: form.type, startTime, endTime, dayOfWeek, daysOfWeek: form.recurrence === 'daily' ? WORK_DAYS.map((day) => day.value) : [dayOfWeek], date: isOneTime ? form.date : undefined, isOverride: isOneTime, validFrom: isOneTime ? undefined : form.validFrom || undefined, validUntil: isOneTime ? undefined : form.validUntil || undefined, notes: form.notes.trim() || undefined }
}

export function getSelectionForEvent(event: ScheduleEvent, roomId: string, dayOfWeek: number, viewMode: SchedulerViewMode): Selection {
  const slotMinutes = viewMode === 'day' ? DAY_VIEW_SLOT_MINUTES : SLOT_MINUTES
  const slotCount = viewMode === 'day' ? DAY_VIEW_SLOT_COUNT : SLOT_COUNT
  const startSlot = Math.max(0, Math.floor((timeToMinutes(event.startTime) - PLANNING_START_HOUR * 60) / slotMinutes))
  const endSlot = Math.min(slotCount - 1, Math.ceil((timeToMinutes(event.endTime) - PLANNING_START_HOUR * 60) / slotMinutes) - 1)
  return { roomId, dayOfWeek, startSlot, endSlot, slotMinutes }
}
