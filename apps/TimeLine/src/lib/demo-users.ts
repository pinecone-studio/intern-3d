import type { User, UserRole } from './types'

export const demoUsers: Record<UserRole, User> = {
  admin: {
    id: 'admin-1',
    name: 'Ariun Admin',
    role: 'admin',
    assignedDevice: null,
  },
  student: {
    id: 'student-1',
    name: 'Maya Student',
    role: 'student',
    assignedDevice: {
      id: 'room-301-device-1',
      name: 'iMac-01',
      roomId: 'room-301',
      roomNumber: '301',
      status: 'assigned',
      assignedTo: 'student-1',
    },
  },
}

export function getDemoUser(role: UserRole): User {
  return demoUsers[role]
}
