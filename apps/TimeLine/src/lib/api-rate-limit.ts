import { NextResponse } from 'next/server'

type RateLimitOptions = {
  key: string
  limit: number
  windowMs: number
}

type RateLimitEntry = {
  count: number
  resetAt: number
}

const globalRateLimit = globalThis as typeof globalThis & {
  __timelineRateLimitStore__?: Map<string, RateLimitEntry>
}

const store = globalRateLimit.__timelineRateLimitStore__ ?? new Map<string, RateLimitEntry>()
globalRateLimit.__timelineRateLimitStore__ = store

function getClientIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'anonymous'
  )
}

export function checkRateLimit(request: Request, options: RateLimitOptions) {
  const now = Date.now()
  const storeKey = `${options.key}:${getClientIp(request)}`
  const current = store.get(storeKey)

  if (!current || current.resetAt <= now) {
    const next = { count: 1, resetAt: now + options.windowMs }
    store.set(storeKey, next)
    return { allowed: true, remaining: options.limit - 1, resetAt: next.resetAt }
  }

  if (current.count >= options.limit) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt }
  }

  current.count += 1
  return { allowed: true, remaining: options.limit - current.count, resetAt: current.resetAt }
}

export function createRateLimitResponse(options: RateLimitOptions, resetAt: number) {
  return NextResponse.json(
    { error: 'Too many requests', message: 'Please try again shortly.' },
    {
      status: 429,
      headers: {
        'Retry-After': String(Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))),
        'X-RateLimit-Limit': String(options.limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.floor(resetAt / 1000)),
      },
    }
  )
}

export function applyRateLimitHeaders(response: Response, options: RateLimitOptions, remaining: number, resetAt: number) {
  response.headers.set('X-RateLimit-Limit', String(options.limit))
  response.headers.set('X-RateLimit-Remaining', String(remaining))
  response.headers.set('X-RateLimit-Reset', String(Math.floor(resetAt / 1000)))
  return response
}//
