import { getNextEvent } from '@/lib/timeline-status'
import type { ScheduleEvent } from '@/lib/types'

function createRecurringEvent(overrides: Partial<ScheduleEvent>): ScheduleEvent {
  return {
    id: overrides.id ?? 'event-1',
    roomId: overrides.roomId ?? 'room-1',
    title: overrides.title ?? 'Recurring class',
    groupId: overrides.groupId,
    type: overrides.type ?? 'class',
    startTime: overrides.startTime ?? '09:00',
    endTime: overrides.endTime ?? '10:00',
    dayOfWeek: overrides.dayOfWeek ?? 1,
    daysOfWeek: overrides.daysOfWeek ?? [1],
    date: overrides.date,
    isOverride: overrides.isOverride ?? false,
    instructor: overrides.instructor,
    notes: overrides.notes,
    validFrom: overrides.validFrom,
    validUntil: overrides.validUntil,
  }
}

describe('getNextEvent', () => {
  it('returns the next event later on the same day', () => {
    const now = new Date('2026-05-04T08:30:00')
    const nextEvent = getNextEvent([
      createRecurringEvent({ id: 'today-1', title: 'Math', startTime: '10:00', endTime: '11:00' }),
      createRecurringEvent({ id: 'tomorrow-1', title: 'Science', startTime: '08:00', endTime: '09:00', dayOfWeek: 2, daysOfWeek: [2] }),
    ], now)

    expect(nextEvent?.id).toBe('today-1')
  })

  it('returns null when there is no remaining schedule for the current day', () => {
    const now = new Date('2026-05-04T12:00:00')
    const nextEvent = getNextEvent([
      createRecurringEvent({ id: 'tomorrow-1', title: 'Science', startTime: '08:00', endTime: '09:00', dayOfWeek: 2, daysOfWeek: [2] }),
    ], now)

    expect(nextEvent).toBeNull()
  })

  it('ignores tomorrow overrides when today has no upcoming schedule', () => {
    const now = new Date('2026-05-04T15:00:00')
    const nextEvent = getNextEvent([
      createRecurringEvent({
        id: 'override-1',
        title: 'Special lab',
        startTime: '09:00',
        endTime: '10:00',
        isOverride: true,
        date: '2026-05-05',
        dayOfWeek: 2,
        daysOfWeek: [2],
      }),
    ], now)

    expect(nextEvent).toBeNull()
  })
})
