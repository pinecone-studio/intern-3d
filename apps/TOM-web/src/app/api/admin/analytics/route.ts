import type { NextRequest } from 'next/server'

import { requireAdmin } from '@/lib/tom-api-auth'
import { getTomDb } from '@/lib/d1'
import { ok, serverError } from '@/lib/tom-http'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (auth.response) return auth.response

    const db = getTomDb()

    const [userStats, xpDist, topClubs] = await Promise.all([
      db
        .prepare(
          `SELECT
            COUNT(*) as total_users,
            SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) as students,
            SUM(CASE WHEN role = 'teacher' THEN 1 ELSE 0 END) as teachers,
            SUM(CASE WHEN account_status = 'active' THEN 1 ELSE 0 END) as active_users,
            SUM(CASE WHEN account_status = 'banned' THEN 1 ELSE 0 END) as banned_users
           FROM users`
        )
        .first<{
          total_users: number
          students: number
          teachers: number
          active_users: number
          banned_users: number
        }>(),
      db
        .prepare(
          `SELECT
            COALESCE(SUM(amount), 0) as total_xp,
            COUNT(*) as total_grants,
            COALESCE(AVG(amount), 0) as avg_xp_per_grant
           FROM xp_logs`
        )
        .first<{ total_xp: number; total_grants: number; avg_xp_per_grant: number }>(),
      db
        .prepare(
          `SELECT name, interest_count FROM clubs ORDER BY interest_count DESC LIMIT 10`
        )
        .all<{ name: string; interest_count: number }>(),
    ])

    return ok({
      users: {
        total: userStats?.total_users ?? 0,
        students: userStats?.students ?? 0,
        teachers: userStats?.teachers ?? 0,
        active: userStats?.active_users ?? 0,
        banned: userStats?.banned_users ?? 0,
      },
      xp: {
        total: xpDist?.total_xp ?? 0,
        grants: xpDist?.total_grants ?? 0,
        avgPerGrant: Math.round(xpDist?.avg_xp_per_grant ?? 0),
      },
      topClubsByInterest: topClubs.results,
    })
  } catch (error) {
    return serverError('Failed to load analytics.', String(error))
  }
}
