import type { ScheduleOverrideRow } from '@/db/schema'
import { FIXTURE_CREATED_AT } from '@/lib/timeline-seed-shared'

export const seedOverrides: ScheduleOverrideRow[] = [
  {
    id: 'override-301-maintenance',
    roomId: 'room-301',
    date: '2026-04-24',
    startTime: '08:00',
    endTime: '12:00',
    type: 'closed',
    title: 'Projector Maintenance',
    instructor: 'Facilities Team',
    notes: 'Room closed for maintenance.',
    createdBy: 'admin-1',
    createdAt: FIXTURE_CREATED_AT,
  },
]
