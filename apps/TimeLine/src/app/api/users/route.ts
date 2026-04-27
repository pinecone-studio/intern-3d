import { NextResponse } from 'next/server'
import { listTimelineUsers } from '@/lib/timeline-users'

export async function GET() {
  const users = await listTimelineUsers()
  return NextResponse.json({ users })
}
