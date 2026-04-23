import { sql } from 'drizzle-orm'
import { getDrizzleDb } from '@/db/client'
import { deviceAssignmentsTable, roomsTable, scheduleOverridesTable, schedulesTable, usersTable } from '@/db/schema'

export async function seedTimelineDatabase(options: { reset?: boolean } = {}) {
  const db = getDrizzleDb()
  const now = new Date().toISOString()

  const users = [
    { id: 'admin-1', name: 'Ariun Admin', email: 'admin@school.local', role: 'admin', createdAt: now },
    { id: 'student-1', name: 'Maya Student', email: 'maya.student@school.local', role: 'student', createdAt: now },
    { id: 'student-2', name: 'Noah Student', email: 'noah.student@school.local', role: 'student', createdAt: now },
    { id: 'student-3', name: 'Lena Student', email: 'lena.student@school.local', role: 'student', createdAt: now },
  ] as const

  const rooms = [
    { id: 'room-301', name: '301', floor: 3, type: 'lab', capacity: 32, createdAt: now },
    { id: 'room-302', name: '302', floor: 3, type: 'lab', capacity: 28, createdAt: now },
    { id: 'room-303', name: '303', floor: 3, type: 'lab', capacity: 30, createdAt: now },
    { id: 'room-304', name: '304', floor: 3, type: 'lab', capacity: 26, createdAt: now },
    { id: 'room-305', name: '305', floor: 3, type: 'lab', capacity: 24, createdAt: now },
    { id: 'room-401', name: '401', floor: 4, type: 'lab', capacity: 36, createdAt: now },
    { id: 'room-402', name: '402', floor: 4, type: 'event_hall', capacity: 80, createdAt: now },
    { id: 'room-403', name: '403', floor: 4, type: 'lab', capacity: 34, createdAt: now },
  ] as const

  const schedules = [
    { id: 'schedule-physics-101', roomId: 'room-301', title: 'Physics 101', type: 'class', daysOfWeek: JSON.stringify([1, 3, 5]), startTime: '08:00', endTime: '09:30', startDate: '2026-01-12', endDate: '2026-12-18', createdBy: 'admin-1', createdAt: now },
    { id: 'schedule-chemistry-lab', roomId: 'room-302', title: 'Chemistry Lab', type: 'class', daysOfWeek: JSON.stringify([2, 4]), startTime: '10:00', endTime: '12:00', startDate: '2026-01-12', endDate: '2026-12-18', createdBy: 'admin-1', createdAt: now },
    { id: 'schedule-advanced-math', roomId: 'room-401', title: 'Advanced Mathematics', type: 'class', daysOfWeek: JSON.stringify([1, 3, 5]), startTime: '13:00', endTime: '14:30', startDate: '2026-01-12', endDate: '2026-12-18', createdBy: 'admin-1', createdAt: now },
    { id: 'schedule-robotics-club', roomId: 'room-303', title: 'Robotics Club', type: 'club', daysOfWeek: JSON.stringify([2, 4]), startTime: '15:30', endTime: '17:00', startDate: '2026-01-12', endDate: '2026-12-18', createdBy: 'admin-1', createdAt: now },
    { id: 'schedule-debate-society', roomId: 'room-402', title: 'Debate Society', type: 'club', daysOfWeek: JSON.stringify([3, 5]), startTime: '16:00', endTime: '17:30', startDate: '2026-01-12', endDate: '2026-12-18', createdBy: 'admin-1', createdAt: now },
    { id: 'schedule-open-study-lab', roomId: 'room-304', title: 'Open Study Lab', type: 'open', daysOfWeek: JSON.stringify([1, 2, 3, 4, 5]), startTime: '09:00', endTime: '12:00', startDate: '2026-01-12', endDate: '2026-12-18', createdBy: 'admin-1', createdAt: now },
    { id: 'schedule-weekend-open-access', roomId: 'room-305', title: 'Weekend Open Access', type: 'open', daysOfWeek: JSON.stringify([6]), startTime: '10:00', endTime: '14:00', startDate: '2026-01-12', endDate: '2026-12-18', createdBy: 'admin-1', createdAt: now },
  ] as const

  const overrides = [
    { id: 'override-301-maintenance', roomId: 'room-301', date: '2026-04-24', startTime: '08:00', endTime: '12:00', type: 'closed', title: 'Projector Maintenance', createdBy: 'admin-1', createdAt: now },
    { id: 'override-303-makeup-lab', roomId: 'room-303', date: '2026-04-27', startTime: '14:00', endTime: '16:00', type: 'class', title: 'Make-up Programming Lab', createdBy: 'admin-1', createdAt: now },
  ] as const

  const devices = rooms.flatMap(room =>
    Array.from({ length: 6 }, (_, index) => ({
      id: `${room.id}-device-${index + 1}`,
      roomId: room.id,
      deviceName: `iMac-${String(index + 1).padStart(2, '0')}`,
      userId: room.id === 'room-301' && index === 0 ? 'student-1' : null,
    }))
  )

  if (options.reset) {
    await db.delete(deviceAssignmentsTable)
    await db.delete(scheduleOverridesTable)
    await db.delete(schedulesTable)
    await db.delete(roomsTable)
    await db.delete(usersTable)
  }

  const existingRooms = await db.select({ count: sql<number>`count(*)` }).from(roomsTable)
  if ((existingRooms[0]?.count ?? 0) > 0 && !options.reset) {
    return { seeded: false, reason: 'rooms already exist' as const }
  }

  await db.insert(usersTable).values(users)
  await db.insert(roomsTable).values(rooms)
  await db.insert(schedulesTable).values(schedules)
  await db.insert(scheduleOverridesTable).values(overrides)
  await db.insert(deviceAssignmentsTable).values(devices)

  return {
    seeded: true,
    users: users.length,
    rooms: rooms.length,
    events: schedules.length + overrides.length,
    devices: devices.length,
  }
}
