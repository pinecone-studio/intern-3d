import { NextResponse } from 'next/server'
import { listScheduleEvents } from '@/lib/timeline-rest'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const events = await listScheduleEvents({
    roomId: searchParams.get('roomId'),
    dayOfWeek: searchParams.get('dayOfWeek'),
    instructor: searchParams.get('instructor'),
  })

  return NextResponse.json({ events })
}
