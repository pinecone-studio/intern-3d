import { NextResponse } from 'next/server'
import { listTimelineUsers } from '@/lib/timeline-users'

export async function GET() {
  try {
    const users = await listTimelineUsers()
    return NextResponse.json({ users })
  } catch (error) {
    console.error('Failed to load timeline users.', error)
    return NextResponse.json(
      { users: [], error: 'Хэрэглэгчдийн жагсаалтыг уншиж чадсангүй.' },
      { status: 500 }
    )
  }
}
