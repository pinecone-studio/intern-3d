import { NextResponse } from 'next/server'
import { applyRateLimitHeaders, checkRateLimit, createRateLimitResponse } from '@/lib/api-rate-limit'
import { listScheduleEvents } from '@/lib/timeline-rest'

export async function GET(request: Request) {
  const rateLimit = { key: 'events', limit: 60, windowMs: 60_000 }
  const result = checkRateLimit(request, rateLimit)
  if (!result.allowed) return createRateLimitResponse(rateLimit, result.resetAt)

  const { searchParams } = new URL(request.url)
  const events = await listScheduleEvents({
    roomId: searchParams.get('roomId'),
    dayOfWeek: searchParams.get('dayOfWeek'),
    instructor: searchParams.get('instructor'),
  })

  return applyRateLimitHeaders(NextResponse.json({ events }), rateLimit, result.remaining, result.resetAt)
}
