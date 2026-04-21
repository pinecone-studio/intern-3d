import { NextResponse } from 'next/server'
import { applyRateLimitHeaders, checkRateLimit, createRateLimitResponse } from '@/lib/api-rate-limit'
import { getTimelineDb } from '@/lib/d1'

export async function GET(request: Request) {
  const rateLimit = { key: 'db-status', limit: 20, windowMs: 60_000 }
  const limitResult = checkRateLimit(request, rateLimit)
  if (!limitResult.allowed) return createRateLimitResponse(rateLimit, limitResult.resetAt)

  const db = getTimelineDb()

  const [tablesResult, roomsCountResult, eventsCountResult] = await Promise.all([
    db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
      .all<{ name: string }>(),
    db.prepare('SELECT COUNT(*) AS count FROM rooms').all<{ count: number }>().catch(() => ({ results: [] })),
    db.prepare('SELECT COUNT(*) AS count FROM schedule_events').all<{ count: number }>().catch(() => ({ results: [] })),
  ])

  return applyRateLimitHeaders(
    NextResponse.json({
      ok: true,
      binding: 'ACADEMIC_TIMELINE_DB',
      tables: tablesResult.results.map((table: { name: string }) => table.name),
      roomCount: roomsCountResult.results[0]?.count ?? 0,
      scheduleEventCount: eventsCountResult.results[0]?.count ?? 0,
    }),
    rateLimit,
    limitResult.remaining,
    limitResult.resetAt
  )
}
