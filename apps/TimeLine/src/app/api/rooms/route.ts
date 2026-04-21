import { NextResponse } from 'next/server'
import { applyRateLimitHeaders, checkRateLimit, createRateLimitResponse } from '@/lib/api-rate-limit'
import { listRooms } from '@/lib/timeline-rest'

export async function GET(request: Request) {
  const rateLimit = { key: 'rooms', limit: 60, windowMs: 60_000 }
  const result = checkRateLimit(request, rateLimit)
  if (!result.allowed) return createRateLimitResponse(rateLimit, result.resetAt)

  const { searchParams } = new URL(request.url)
  const rooms = await listRooms({
    floor: searchParams.get('floor'),
    status: searchParams.get('status'),
    search: searchParams.get('search'),
  })

  return applyRateLimitHeaders(NextResponse.json({ rooms }), rateLimit, result.remaining, result.resetAt)
}
