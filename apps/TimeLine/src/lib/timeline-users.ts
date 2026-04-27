import { asc, eq } from 'drizzle-orm'
import { getDrizzleDb } from '@/db/client'
import { deviceAssignmentsTable, roomsTable, usersTable } from '@/db/schema'
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

export async function listTimelineUsers(): Promise<User[]> {
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
}

export async function getTimelineUser(userId: string): Promise<User | null> {
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
}
