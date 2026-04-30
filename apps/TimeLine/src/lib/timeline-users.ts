import { getTimelineDb } from '@/lib/d1'
import { seedUsers } from '@/lib/timeline-seed-fixtures'
import type { User } from '@/lib/types'

type TimelineUserRow = User

function mapTimelineUser(row: TimelineUserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role as User['role'],
  }
}

function listFallbackUsers(): User[] {
  return seedUsers
    .map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as User['role'],
    }))
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
        users.role AS role
      FROM users
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
        users.role AS role
      FROM users
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
