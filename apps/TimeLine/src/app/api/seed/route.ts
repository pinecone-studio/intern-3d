import { NextResponse } from 'next/server'
import { seedTimelineDatabase } from '@/lib/timeline-rest'

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { reset?: boolean }
  const result = await seedTimelineDatabase({ reset: body.reset === true })
  return NextResponse.json(result)
}
