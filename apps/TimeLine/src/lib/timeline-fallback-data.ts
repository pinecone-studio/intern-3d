import type { DeviceAssignmentRow, RoomRow, ScheduleOverrideRow, ScheduleRow } from '@/db/schema'

const FALLBACK_CREATED_AT = '2026-04-01T00:00:00.000Z'
const FALLBACK_CREATED_BY = 'admin-1'

export const fallbackRooms: RoomRow[] = [
  { id: 'room-301', name: '301', floor: 3, type: 'lab', capacity: 32, createdAt: FALLBACK_CREATED_AT },
  { id: 'room-302', name: '302', floor: 3, type: 'lab', capacity: 28, createdAt: FALLBACK_CREATED_AT },
  { id: 'room-303', name: '303', floor: 3, type: 'lab', capacity: 30, createdAt: FALLBACK_CREATED_AT },
  { id: 'room-304', name: '304', floor: 3, type: 'lab', capacity: 26, createdAt: FALLBACK_CREATED_AT },
  { id: 'room-305', name: '305', floor: 3, type: 'lab', capacity: 24, createdAt: FALLBACK_CREATED_AT },
  { id: 'room-401', name: '401', floor: 4, type: 'lab', capacity: 36, createdAt: FALLBACK_CREATED_AT },
  { id: 'room-402', name: '402', floor: 4, type: 'event_hall', capacity: 80, createdAt: FALLBACK_CREATED_AT },
  { id: 'room-403', name: '403', floor: 4, type: 'lab', capacity: 34, createdAt: FALLBACK_CREATED_AT },
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
