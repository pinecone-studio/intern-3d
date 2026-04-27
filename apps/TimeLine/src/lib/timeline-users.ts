import { asc, eq } from 'drizzle-orm'
import { getDrizzleDb } from '@/db/client'
import { deviceAssignmentsTable, roomsTable, usersTable } from '@/db/schema'
import { seedDeviceAssignments, seedRooms, seedUsers } from '@/lib/timeline-seed-fixtures'
import type { Device, User } from '@/lib/types'

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

function mapTimelineUser(
  user: typeof usersTable.$inferSelect,
  deviceName: string | null,
  roomId: string | null,
  roomNumber: string | null
): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as User['role'],
    assignedDevice: mapAssignedDevice(user.id, deviceName, roomId, roomNumber),
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
    const db = getDrizzleDb()
    const rows = await db
      .select({
        user: usersTable,
        deviceName: deviceAssignmentsTable.deviceName,
        roomId: deviceAssignmentsTable.roomId,
        roomNumber: roomsTable.name,
      })
      .from(usersTable)
      .leftJoin(deviceAssignmentsTable, eq(deviceAssignmentsTable.userId, usersTable.id))
      .leftJoin(roomsTable, eq(deviceAssignmentsTable.roomId, roomsTable.id))
      .orderBy(asc(usersTable.role), asc(usersTable.name))

    return rows.map((row) => mapTimelineUser(row.user, row.deviceName, row.roomId, row.roomNumber))
  } catch (error) {
    console.warn('Falling back to seed users because timeline users could not be loaded.', error)
    return listFallbackUsers()
  }
}

export async function getTimelineUser(userId: string): Promise<User | null> {
  try {
    const db = getDrizzleDb()
    const [row] = await db
      .select({
        user: usersTable,
        deviceName: deviceAssignmentsTable.deviceName,
        roomId: deviceAssignmentsTable.roomId,
        roomNumber: roomsTable.name,
      })
      .from(usersTable)
      .leftJoin(deviceAssignmentsTable, eq(deviceAssignmentsTable.userId, usersTable.id))
      .leftJoin(roomsTable, eq(deviceAssignmentsTable.roomId, roomsTable.id))
      .where(eq(usersTable.id, userId))
      .limit(1)

    if (!row) return null
    return mapTimelineUser(row.user, row.deviceName, row.roomId, row.roomNumber)
  } catch (error) {
    console.warn('Falling back to seed users because timeline user could not be loaded.', error)
    return listFallbackUsers().find((entry) => entry.id === userId) ?? null
  }
}
