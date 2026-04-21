import { applyRateLimitHeaders, checkRateLimit, createRateLimitResponse } from '@/lib/api-rate-limit'

export async function GET(request: Request) {
  const rateLimit = { key: 'hello', limit: 30, windowMs: 60_000 }
  const limitResult = checkRateLimit(request, rateLimit)
  if (!limitResult.allowed) return createRateLimitResponse(rateLimit, limitResult.resetAt)

  return applyRateLimitHeaders(new Response('Hello, from API!'), rateLimit, limitResult.remaining, limitResult.resetAt)
}
