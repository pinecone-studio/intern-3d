import { getTimelineDb } from '@/lib/d1'
import { seedDeviceAssignments, seedRooms, seedUsers } from '@/lib/timeline-seed-fixtures'
import type { Device, User } from '@/lib/types'

type TimelineUserRow = User & {
  deviceName: string | null
  roomId: string | null
  roomNumber: string | null
}

function mapAssignedDevice(userId: string, deviceName: string | null, roomId: string | null, roomNumber: string | null): Device | null {
  if (!deviceName || !roomId || !roomNumber) return null

  return {
    id: `${roomId}:${deviceName}`,
    name: deviceName,
    roomId,
    roomNumber,
    status: 'assigned',
    assignedTo: userId,
  }
}

function mapTimelineUser(row: TimelineUserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as User['role'],
    assignedDevice: mapAssignedDevice(row.id, row.deviceName, row.roomId, row.roomNumber),
  }
}

function listFallbackUsers(): User[] {
  return seedUsers
    .map((user) => {
      const assignment = seedDeviceAssignments.find((entry) => entry.userId === user.id)
      const room = assignment ? seedRooms.find((entry) => entry.id === assignment.roomId) : null

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as User['role'],
        assignedDevice:
          assignment && room
            ? mapAssignedDevice(user.id, assignment.deviceName, assignment.roomId, room.name)
            : null,
      }
    })
    .sort((first, second) => {
      const roleCompare = first.role.localeCompare(second.role)
      return roleCompare === 0 ? first.name.localeCompare(second.name) : roleCompare
    })
}

export async function listTimelineUsers(): Promise<User[]> {
  try {
    const result = await getTimelineDb().prepare(`
      SELECT
        users.id AS id,
        users.name AS name,
        users.email AS email,
        users.role AS role,
        device_assignments.device_name AS deviceName,
        device_assignments.room_id AS roomId,
        rooms.name AS roomNumber
      FROM users
      LEFT JOIN device_assignments ON device_assignments.user_id = users.id
      LEFT JOIN rooms ON device_assignments.room_id = rooms.id
      ORDER BY users.role ASC, users.name ASC
    `).all<TimelineUserRow>()

    return result.results.map((row) => mapTimelineUser(row))
  } catch (error) {
    console.warn('Falling back to seed users because timeline users could not be loaded.', error)
    return listFallbackUsers()
  }
}

export async function getTimelineUser(userId: string): Promise<User | null> {
  try {
    const result = await getTimelineDb().prepare(`
      SELECT
        users.id AS id,
        users.name AS name,
        users.email AS email,
        users.role AS role,
        device_assignments.device_name AS deviceName,
        device_assignments.room_id AS roomId,
        rooms.name AS roomNumber
      FROM users
      LEFT JOIN device_assignments ON device_assignments.user_id = users.id
      LEFT JOIN rooms ON device_assignments.room_id = rooms.id
      WHERE users.id = ?
      LIMIT 1
    `).bind(userId).all<TimelineUserRow>()
    const row = result.results[0]

    if (!row) return null
    return mapTimelineUser(row)
  } catch (error) {
    console.warn('Falling back to seed users because timeline user could not be loaded.', error)
    return listFallbackUsers().find((entry) => entry.id === userId) ?? null
  }
}
