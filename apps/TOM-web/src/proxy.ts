import { NextRequest, NextResponse } from 'next/server'

const TOM_SESSION_COOKIE_NAME = 'tom_session'

function requiresSession(pathname: string, method: string) {
  if (pathname === '/api/club-requests') return true
  if (pathname.startsWith('/api/club-requests/')) return true
  if (pathname === '/api/seed') return true
  if (pathname === '/api/users' || pathname.startsWith('/api/users/')) return true
  if (pathname === '/api/xp/grant') return true
  if (pathname === '/api/xp/config' && method !== 'GET') return true
  if (pathname.startsWith('/api/xp/') && pathname !== '/api/xp/config') return true
  if (pathname === '/api/badges' && method !== 'GET') return true
  if (pathname === '/api/badges/award') return true
  if (pathname.startsWith('/api/badges/') && method !== 'GET') return true

  return false
}

export function proxy(request: NextRequest) {
  if (!requiresSession(request.nextUrl.pathname, request.method)) {
    return NextResponse.next()
  }

  if (!request.cookies.get(TOM_SESSION_COOKIE_NAME)?.value) {
    return NextResponse.json({ error: 'Session not found.' }, { status: 401 })
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/club-requests/:path*',
    '/api/seed',
    '/api/users/:path*',
    '/api/xp/:path*',
    '/api/badges/:path*',
  ],
}
