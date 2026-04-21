import { NextResponse } from 'next/server'
import { applyRateLimitHeaders, checkRateLimit, createRateLimitResponse } from '@/lib/api-rate-limit'
import { getRoomDetail } from '@/lib/timeline-rest'

export async function GET(request: Request, context: { params: Promise<{ roomId: string }> }) {
  const rateLimit = { key: 'room-detail', limit: 90, windowMs: 60_000 }
  const limitResult = checkRateLimit(request, rateLimit)
  if (!limitResult.allowed) return createRateLimitResponse(rateLimit, limitResult.resetAt)

  const { roomId } = await context.params
  const result = await getRoomDetail(roomId)

  if (!result) {
    return applyRateLimitHeaders(
      NextResponse.json({ error: 'Room not found' }, { status: 404 }),
      rateLimit,
      limitResult.remaining,
      limitResult.resetAt
    )
  }

  return applyRateLimitHeaders(NextResponse.json(result), rateLimit, limitResult.remaining, limitResult.resetAt)
}
