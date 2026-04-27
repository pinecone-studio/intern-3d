import { getTomDb } from '@/lib/d1'
import type { TomCurrentUser, TomSession } from '@/lib/tom-types'

export const DEFAULT_SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7

type SessionRow = {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  expires_at: string
}

type CurrentUserRow = {
  session_id: string
  session_expires_at: string
  id: string
  full_name: string
  email: string
  role: TomCurrentUser['role']
  teacher_profile_name: string
  account_status: TomCurrentUser['accountStatus']
  reason: string
  last_active: string
  club_count: number
  notes: string
  created_at: string
  updated_at: string
}

function nowIso() {
  return new Date().toISOString()
}

function expiresAtFromNow(ttlMs = DEFAULT_SESSION_TTL_MS) {
  return new Date(Date.now() + ttlMs).toISOString()
}

function isExpired(expiresAt: string, now = nowIso()) {
  return expiresAt <= now
}

function mapSessionRow(row: SessionRow): TomSession {
  return {
    id: row.id,
    userId: row.user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    expiresAt: row.expires_at,
  }
}

function mapCurrentUserRow(row: CurrentUserRow): TomCurrentUser {
  return {
    id: row.id,
    name: row.full_name,
    email: row.email,
    role: row.role,
    teacherProfileName: row.teacher_profile_name || undefined,
    accountStatus: row.account_status,
    reason: row.reason,
    lastActive: row.last_active,
    clubCount: row.club_count,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    sessionId: row.session_id,
    sessionExpiresAt: row.session_expires_at,
  }
}

export async function createSession(userId: string, ttlMs = DEFAULT_SESSION_TTL_MS): Promise<TomSession> {
  const db = getTomDb()
  const id = crypto.randomUUID()
  const now = nowIso()
  const expiresAt = expiresAtFromNow(ttlMs)

  await db
    .prepare(
      `INSERT INTO sessions (id, user_id, created_at, updated_at, expires_at)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(id, userId, now, now, expiresAt)
    .run()

  return {
    id,
    userId,
    createdAt: now,
    updatedAt: now,
    expiresAt,
  }
}

export async function getSession(sessionId: string): Promise<TomSession | null> {
  const db = getTomDb()
  const row = await db
    .prepare('SELECT * FROM sessions WHERE id = ? LIMIT 1')
    .bind(sessionId)
    .first<SessionRow>()

  return row ? mapSessionRow(row) : null
}

export async function getCurrentUserFromSession(sessionId: string): Promise<TomCurrentUser | null> {
  const db = getTomDb()
  const now = nowIso()
  const row = await db
    .prepare(
      `SELECT
         s.id AS session_id,
         s.expires_at AS session_expires_at,
         u.id,
         u.full_name,
         u.email,
         u.role,
         u.teacher_profile_name,
         u.account_status,
         u.reason,
         u.last_active,
         u.club_count,
         u.notes,
         u.created_at,
         u.updated_at
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = ?
         AND s.expires_at > ?
       LIMIT 1`
    )
    .bind(sessionId, now)
    .first<CurrentUserRow>()

  return row ? mapCurrentUserRow(row) : null
}

export async function touchSession(sessionId: string, ttlMs = DEFAULT_SESSION_TTL_MS): Promise<TomSession | null> {
  const db = getTomDb()
  const current = await getSession(sessionId)
  if (!current) return null
  if (isExpired(current.expiresAt)) return null

  const updatedAt = nowIso()
  const expiresAt = expiresAtFromNow(ttlMs)

  await db
    .prepare(
      `UPDATE sessions
       SET updated_at = ?, expires_at = ?
       WHERE id = ?`
    )
    .bind(updatedAt, expiresAt, sessionId)
    .run()

  return {
    ...current,
    updatedAt,
    expiresAt,
  }
}

export async function listSessionsForUser(userId: string): Promise<TomSession[]> {
  const db = getTomDb()
  const result = await db
    .prepare('SELECT * FROM sessions WHERE user_id = ? ORDER BY updated_at DESC')
    .bind(userId)
    .all<SessionRow>()

  return result.results.map(mapSessionRow)
}

export async function deleteSession(sessionId: string): Promise<boolean> {
  const db = getTomDb()
  const current = await getSession(sessionId)
  if (!current) return false

  await db.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run()
  return true
}

export async function deleteExpiredSessions(now = nowIso()): Promise<number> {
  const db = getTomDb()
  const result = await db
    .prepare('DELETE FROM sessions WHERE expires_at <= ?')
    .bind(now)
    .run()

  return result.meta.changes ?? 0
}

export async function deleteSessionsForUser(userId: string): Promise<number> {
  const db = getTomDb()
  const result = await db
    .prepare('DELETE FROM sessions WHERE user_id = ?')
    .bind(userId)
    .run()

  return result.meta.changes ?? 0
}
