import { NextResponse } from 'next/server'
import { TIMELINE_SESSION_COOKIE, TIMELINE_SESSION_MAX_AGE_SECONDS, getTimelineSessionUserIdFromRequest } from '@/lib/session'
import { getTimelineUser } from '@/lib/timeline-users'

type SessionBody = {
  userId?: string
}

export async function GET(request: Request) {
  const userId = getTimelineSessionUserIdFromRequest(request)
  if (!userId) {
    return NextResponse.json({ user: null })
  }

  const user = await getTimelineUser(userId)
  if (user) {
    return NextResponse.json({ user })
  }

  const response = NextResponse.json({ user: null })
  response.cookies.set(TIMELINE_SESSION_COOKIE, '', {
    path: '/',
    maxAge: 0,
  })
  return response
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as SessionBody
  if (!body.userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 })
  }

  const user = await getTimelineUser(body.userId)
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const response = NextResponse.json({ user })
  response.cookies.set(TIMELINE_SESSION_COOKIE, user.id, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: TIMELINE_SESSION_MAX_AGE_SECONDS,
  })
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ user: null })
  response.cookies.set(TIMELINE_SESSION_COOKIE, '', {
    path: '/',
    maxAge: 0,
  })
  return response
}
