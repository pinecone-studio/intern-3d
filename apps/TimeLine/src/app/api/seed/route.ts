import { NextResponse } from 'next/server'
import { applyRateLimitHeaders, checkRateLimit, createRateLimitResponse } from '@/lib/api-rate-limit'
import { seedTimelineDatabase } from '@/lib/timeline-rest'

export async function POST(request: Request) {
  const rateLimit = { key: 'seed', limit: 5, windowMs: 10 * 60_000 }
  const limitResult = checkRateLimit(request, rateLimit)
  if (!limitResult.allowed) return createRateLimitResponse(rateLimit, limitResult.resetAt)

  const body = (await request.json().catch(() => ({}))) as { reset?: boolean }
  const result = await seedTimelineDatabase({ reset: body.reset === true })
  return applyRateLimitHeaders(NextResponse.json(result), rateLimit, limitResult.remaining, limitResult.resetAt)
}
