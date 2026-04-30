import { getLeaderboard } from '@/lib/tom-db'
import { requireAdmin } from '@/lib/tom-api-auth'
import { ok, serverError } from '@/lib/tom-http'
import { getLevel } from '@/lib/level-service'
import type { NextRequest } from 'next/server'


export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (auth.response) return auth.response

    const url = new URL(request.url)
    const limitParam = Number(url.searchParams.get('limit') ?? '5')
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 20) : 5

    const leaderboard = await getLeaderboard(limit)
    const withLevel = leaderboard.map((entry) => ({ ...entry, level: getLevel(entry.points) }))
    return ok({ leaderboard: withLevel })
  } catch (error) {
    return serverError('Failed to load leaderboard.', String(error))
  }
}
