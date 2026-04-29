import type { ScheduleEvent } from '@/lib/types'
import type { EventFormData, ScheduleEventMutationInput } from '@/app/dashboard/room/[roomId]/_lib/room-detail-types'

export function createEventFormData(event: ScheduleEvent | null): EventFormData {
  return {
    title: event?.title || '',
    type: event?.type || 'class',
    daysOfWeek: event?.daysOfWeek || [1],
    startTime: event?.startTime || '09:00',
    endTime: event?.endTime || '12:00',
    instructor: event?.instructor || '',
    notes: event?.notes || '',
    isOverride: event?.isOverride || false,
    validFrom: event?.validFrom || '',
    validUntil: event?.validUntil || '',
    date: event?.date || '',
  }
}

export function createMutationInput(roomId: string, formData: EventFormData): ScheduleEventMutationInput {
  return {
    roomId,
    title: formData.title.trim(),
    type: formData.type,
    startTime: formData.startTime,
    endTime: formData.endTime,
    daysOfWeek: formData.daysOfWeek,
    date: formData.date || null,
    isOverride: formData.isOverride,
    instructor: formData.instructor || null,
    notes: formData.notes || null,
    validFrom: formData.validFrom || null,
    validUntil: formData.validUntil || null,
  }
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}
