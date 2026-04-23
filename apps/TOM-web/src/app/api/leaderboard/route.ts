import { getLeaderboard } from '@/lib/tom-db'
import { ok, serverError } from '@/lib/tom-http'

export const runtime = 'edge'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50', 10) || 50, 200)
    const leaderboard = await getLeaderboard(limit)
    return ok({ leaderboard })
  } catch (error) {
    return serverError('Leaderboard ачаалж чадсангүй.', error instanceof Error ? error.message : error)
  }
}
