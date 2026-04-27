import type { DeviceAssignmentRow, RoomRow, ScheduleOverrideRow, ScheduleRow } from '@/db/schema'

const FALLBACK_CREATED_AT = '2026-04-01T00:00:00.000Z'
const FALLBACK_CREATED_BY = 'admin-1'

function fallbackRoom(id: string, name: string, floor: number, type: RoomRow['type'], capacity: number): RoomRow {
  return {
    id,
    name,
    floor,
    type,
    capacity,
    imacCount: type === 'event_hall' ? 0 : capacity,
    isActive: 1,
    notes: null,
    createdAt: FALLBACK_CREATED_AT,
  }
}

export const fallbackRooms: RoomRow[] = [
  fallbackRoom('room-301', '301', 3, 'lab', 32),
  fallbackRoom('room-302', '302', 3, 'lab', 28),
  fallbackRoom('room-303', '303', 3, 'lab', 30),
  fallbackRoom('room-304', '304', 3, 'lab', 26),
  fallbackRoom('room-305', '305', 3, 'lab', 24),
  fallbackRoom('room-306', '306', 3, 'lab', 25),
  fallbackRoom('room-307', '307', 3, 'lab', 25),
  fallbackRoom('room-308', '308', 3, 'lab', 25),
  fallbackRoom('room-309', '309', 3, 'lab', 25),
  fallbackRoom('room-310', '310', 3, 'lab', 25),
  fallbackRoom('room-401', '401', 4, 'lab', 25),
  fallbackRoom('room-402', '402', 4, 'event_hall', 80),
  fallbackRoom('room-403', '403', 4, 'lab', 25),
  fallbackRoom('room-404', '404', 4, 'lab', 25),
  fallbackRoom('room-405', '405', 4, 'lab', 25),
  fallbackRoom('room-406', '406', 4, 'lab', 25),
  fallbackRoom('room-407', '407', 4, 'lab', 25),
  fallbackRoom('room-408', '408', 4, 'lab', 25),
  fallbackRoom('room-409', '409', 4, 'lab', 25),
  fallbackRoom('room-410', '410', 4, 'lab', 25),
]

export const fallbackSchedules: ScheduleRow[] = [
  { id: 'schedule-physics-101', roomId: 'room-301', title: 'Physics 101', type: 'class', daysOfWeek: JSON.stringify([1, 3, 5]), startTime: '08:00', endTime: '09:30', instructor: 'Ariun Admin', notes: 'Core first-year lecture block.', startDate: '2026-01-12', endDate: '2026-12-18', createdBy: FALLBACK_CREATED_BY, createdAt: FALLBACK_CREATED_AT },
  { id: 'schedule-open-study-lab', roomId: 'room-302', title: 'Open Study Lab', type: 'open', daysOfWeek: JSON.stringify([1, 2, 3, 4, 5]), startTime: '09:00', endTime: '12:00', instructor: null, notes: 'Student self-study access.', startDate: '2026-01-12', endDate: '2026-12-18', createdBy: FALLBACK_CREATED_BY, createdAt: FALLBACK_CREATED_AT },
  { id: 'schedule-advanced-math', roomId: 'room-401', title: 'Advanced Mathematics', type: 'class', daysOfWeek: JSON.stringify([1, 3, 5]), startTime: '13:00', endTime: '14:30', instructor: 'Ariun Admin', notes: 'Admin-owned sample schedule for dashboard filtering.', startDate: '2026-01-12', endDate: '2026-12-18', createdBy: FALLBACK_CREATED_BY, createdAt: FALLBACK_CREATED_AT },
  { id: 'schedule-robotics-club', roomId: 'room-303', title: 'Robotics Club', type: 'club', daysOfWeek: JSON.stringify([2, 4]), startTime: '15:30', endTime: '17:00', instructor: 'Enkhmaa Mentor', notes: 'Hands-on robotics club session.', startDate: '2026-01-12', endDate: '2026-12-18', createdBy: FALLBACK_CREATED_BY, createdAt: FALLBACK_CREATED_AT },
  { id: 'schedule-open-access-304', roomId: 'room-304', title: 'Open Access 304', type: 'open', daysOfWeek: JSON.stringify([1, 2, 3, 4, 5]), startTime: '13:00', endTime: '16:00', instructor: null, notes: 'Available for open lab use.', startDate: '2026-01-12', endDate: '2026-12-18', createdBy: FALLBACK_CREATED_BY, createdAt: FALLBACK_CREATED_AT },
  { id: 'schedule-weekend-open-305', roomId: 'room-305', title: 'Weekend Open Access', type: 'open', daysOfWeek: JSON.stringify([6]), startTime: '10:00', endTime: '14:00', instructor: null, notes: 'Weekend student access window.', startDate: '2026-01-12', endDate: '2026-12-18', createdBy: FALLBACK_CREATED_BY, createdAt: FALLBACK_CREATED_AT },
  { id: 'schedule-debate-society', roomId: 'room-402', title: 'Debate Society', type: 'club', daysOfWeek: JSON.stringify([3, 5]), startTime: '16:00', endTime: '17:30', instructor: 'Temuulen Coach', notes: 'Large-room student club booking.', startDate: '2026-01-12', endDate: '2026-12-18', createdBy: FALLBACK_CREATED_BY, createdAt: FALLBACK_CREATED_AT },
  { id: 'schedule-programming-403', roomId: 'room-403', title: 'Programming Workshop', type: 'class', daysOfWeek: JSON.stringify([1, 4]), startTime: '11:00', endTime: '12:30', instructor: 'Ariun Admin', notes: 'Project-based programming workshop.', startDate: '2026-01-12', endDate: '2026-12-18', createdBy: FALLBACK_CREATED_BY, createdAt: FALLBACK_CREATED_AT },
]

export const fallbackOverrides: ScheduleOverrideRow[] = [
  { id: 'override-301-maintenance', roomId: 'room-301', date: '2026-04-24', startTime: '08:00', endTime: '12:00', type: 'closed', title: 'Projector Maintenance', instructor: 'Facilities Team', notes: 'Room closed for maintenance.', createdBy: FALLBACK_CREATED_BY, createdAt: FALLBACK_CREATED_AT },
]

export const fallbackDevices: DeviceAssignmentRow[] = [
  { id: 'room-301-device-1', roomId: 'room-301', deviceName: 'iMac-01', userId: 'student-1' },
  { id: 'room-301-device-2', roomId: 'room-301', deviceName: 'iMac-02', userId: null },
  { id: 'room-302-device-1', roomId: 'room-302', deviceName: 'iMac-01', userId: null },
  { id: 'room-303-device-1', roomId: 'room-303', deviceName: 'iMac-01', userId: null },
  { id: 'room-304-device-1', roomId: 'room-304', deviceName: 'iMac-01', userId: null },
  { id: 'room-305-device-1', roomId: 'room-305', deviceName: 'iMac-01', userId: null },
  { id: 'room-401-device-1', roomId: 'room-401', deviceName: 'iMac-01', userId: null },
  { id: 'room-402-device-1', roomId: 'room-402', deviceName: 'iMac-01', userId: null },
  { id: 'room-403-device-1', roomId: 'room-403', deviceName: 'iMac-01', userId: null },
]
