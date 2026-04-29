import type { UserRow } from '@/db/schema'
import { FIXTURE_CREATED_AT } from '@/lib/timeline-seed-shared'

export const seedUsers: UserRow[] = [
  {
    id: 'admin-1',
    name: 'Ariun Admin',
    email: 'admin@school.local',
    role: 'admin',
    createdAt: FIXTURE_CREATED_AT,
  },
  {
    id: 'student-1',
    name: 'Maya Student',
    email: 'maya.student@school.local',
    role: 'student',
    createdAt: FIXTURE_CREATED_AT,
  },
  {
    id: 'student-2',
    name: 'Noah Student',
    email: 'noah.student@school.local',
    role: 'student',
    createdAt: FIXTURE_CREATED_AT,
  },
  {
    id: 'student-3',
    name: 'Lena Student',
    email: 'lena.student@school.local',
    role: 'student',
    createdAt: FIXTURE_CREATED_AT,
  },
]
