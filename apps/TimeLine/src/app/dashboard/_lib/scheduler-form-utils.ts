import { DAY_VIEW_SLOT_MINUTES, DAY_VIEW_SLOT_COUNT, PLANNING_START_HOUR, SLOT_COUNT, SLOT_MINUTES, WORK_DAYS } from '@/app/dashboard/_lib/scheduler-constants'
import { addDays, toIsoDate } from '@/app/dashboard/_lib/scheduler-date-utils'
import { normalizeTimelineTime, slotToTime, timeToMinutes } from '@/app/dashboard/_lib/scheduler-time-utils'
import type { DraftForm, ScheduleEventMutationInput, Selection, SchedulerViewMode } from '@/app/dashboard/_lib/scheduler-types'
import type { ScheduleEvent } from '@/lib/types'

type MutationInputOptions = {
  forceWeekly?: boolean
  groupId?: string | null
  preserveSelectionTime?: boolean
}

export function getSelectionTimeRange(selection: Selection) {
  return {
    startTime: slotToTime(Math.min(selection.startSlot, selection.endSlot), selection.slotMinutes),
    endTime: slotToTime(Math.max(selection.startSlot, selection.endSlot) + 1, selection.slotMinutes),
  }
}

export function createDefaultForm(selection: Selection, weekStart: Date): DraftForm {
  const { startTime, endTime } = getSelectionTimeRange(selection)
  return { title: '', type: 'class', recurrence: 'weekly', startTime, endTime, validFrom: toIsoDate(addDays(weekStart, selection.dayOfWeek - 1)), validUntil: '', date: toIsoDate(addDays(weekStart, selection.dayOfWeek - 1)), notes: '' }
}

export function createFormFromEvent(event: ScheduleEvent, dayOfWeek: number, weekStart: Date): DraftForm {
  const selectedDate = event.date ?? toIsoDate(addDays(weekStart, dayOfWeek - 1))
  return { title: event.title, type: event.type, recurrence: event.isOverride ? 'one-time' : event.daysOfWeek.length >= WORK_DAYS.length ? 'daily' : 'weekly', startTime: event.startTime, endTime: event.endTime, validFrom: event.validFrom ?? selectedDate, validUntil: event.validUntil ?? '', date: selectedDate, notes: event.notes ?? '' }
}

export function createSchedulerMutationInput(selection: Selection, form: DraftForm, options: MutationInputOptions = {}): ScheduleEventMutationInput {
  const isOneTime = !options.forceWeekly && form.recurrence === 'one-time'
  const selectionTimeRange = getSelectionTimeRange(selection)
  const startTime = normalizeTimelineTime(options.preserveSelectionTime ? selectionTimeRange.startTime : form.startTime)
  const endTime = normalizeTimelineTime(options.preserveSelectionTime ? selectionTimeRange.endTime : form.endTime)
  return { roomId: selection.roomId, title: form.title.trim(), groupId: options.groupId ?? null, type: form.type, startTime, endTime, daysOfWeek: options.forceWeekly ? [selection.dayOfWeek] : form.recurrence === 'daily' ? WORK_DAYS.map((day) => day.value) : [selection.dayOfWeek], date: isOneTime ? form.date : null, isOverride: isOneTime, validFrom: isOneTime ? null : form.validFrom || null, validUntil: isOneTime ? null : form.validUntil || null, notes: form.notes.trim() || null }
}

export function createMutationInputFromEvent(event: ScheduleEvent, overrides: Partial<ScheduleEventMutationInput> = {}): ScheduleEventMutationInput {
  const isOverride = overrides.isOverride ?? event.isOverride
  return {
    roomId: overrides.roomId ?? event.roomId,
    title: overrides.title ?? event.title,
    groupId: overrides.groupId ?? event.groupId ?? null,
    type: overrides.type ?? event.type,
    startTime: normalizeTimelineTime(overrides.startTime ?? event.startTime),
    endTime: normalizeTimelineTime(overrides.endTime ?? event.endTime),
    daysOfWeek: overrides.daysOfWeek ?? event.daysOfWeek,
    date: isOverride ? overrides.date ?? event.date ?? null : null,
    isOverride,
    instructor: overrides.instructor ?? event.instructor ?? null,
    notes: overrides.notes ?? event.notes ?? null,
    validFrom: isOverride ? null : overrides.validFrom ?? event.validFrom ?? null,
    validUntil: isOverride ? null : overrides.validUntil ?? event.validUntil ?? null,
  }
}

export function buildLocalEvent(selection: Selection, form: DraftForm, options: MutationInputOptions = {}): ScheduleEvent {
  const isOneTime = !options.forceWeekly && form.recurrence === 'one-time'
  const selectionTimeRange = getSelectionTimeRange(selection)
  const startTime = normalizeTimelineTime(options.preserveSelectionTime ? selectionTimeRange.startTime : form.startTime)
  const endTime = normalizeTimelineTime(options.preserveSelectionTime ? selectionTimeRange.endTime : form.endTime)
  return { id: `local-${crypto.randomUUID()}`, roomId: selection.roomId, title: form.title.trim(), groupId: options.groupId ?? undefined, type: form.type, startTime, endTime, dayOfWeek: selection.dayOfWeek, daysOfWeek: options.forceWeekly ? [selection.dayOfWeek] : form.recurrence === 'daily' ? WORK_DAYS.map((day) => day.value) : [selection.dayOfWeek], date: isOneTime ? form.date : undefined, isOverride: isOneTime, validFrom: isOneTime ? undefined : form.validFrom || undefined, validUntil: isOneTime ? undefined : form.validUntil || undefined, notes: form.notes.trim() || undefined }
}

export function getSelectionForEvent(event: ScheduleEvent, roomId: string, dayOfWeek: number, viewMode: SchedulerViewMode): Selection {
  const slotMinutes = viewMode === 'day' ? DAY_VIEW_SLOT_MINUTES : SLOT_MINUTES
  const slotCount = viewMode === 'day' ? DAY_VIEW_SLOT_COUNT : SLOT_COUNT
  const startSlot = Math.max(0, Math.floor((timeToMinutes(event.startTime) - PLANNING_START_HOUR * 60) / slotMinutes))
  const endSlot = Math.min(slotCount - 1, Math.ceil((timeToMinutes(event.endTime) - PLANNING_START_HOUR * 60) / slotMinutes) - 1)
  return { roomId, dayOfWeek, startSlot, endSlot, slotMinutes }
}
