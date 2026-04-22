import { NextResponse } from 'next/server'
import { getTomDb } from '@/lib/d1'

export async function GET() {
  const db = getTomDb()

  const [tablesResult, clubsResult, requestsResult, usersResult] = await Promise.all([
    db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
      .all<{ name: string }>(),
    db.prepare('SELECT COUNT(*) AS count FROM clubs').all<{ count: number }>().catch(() => ({ results: [] })),
    db
      .prepare('SELECT COUNT(*) AS count FROM club_requests')
      .all<{ count: number }>()
      .catch(() => ({ results: [] })),
    db.prepare('SELECT COUNT(*) AS count FROM users').all<{ count: number }>().catch(() => ({ results: [] })),
  ])

  return NextResponse.json({
    ok: true,
    binding: 'TOM_DB',
    tables: tablesResult.results.map((table: { name: string }) => table.name),
    clubCount: clubsResult.results[0]?.count ?? 0,
    requestCount: requestsResult.results[0]?.count ?? 0,
    userCount: usersResult.results[0]?.count ?? 0,
  })
}
