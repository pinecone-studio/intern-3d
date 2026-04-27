import type { NextRequest, NextResponse } from 'next/server'

import { getCurrentUserFromSession, touchSession, DEFAULT_SESSION_TTL_MS } from '@/lib/tom-session'

export const TOM_SESSION_COOKIE_NAME = 'tom_session'
export const TOM_SESSION_COOKIE_MAX_AGE_SECONDS = Math.floor(DEFAULT_SESSION_TTL_MS / 1000)

function isSecureRequest(request: NextRequest) {
  const forwardedProto = request.headers.get('x-forwarded-proto')
  return forwardedProto === 'https' || request.nextUrl.protocol === 'https:'
}

export function getSessionIdFromRequest(request: NextRequest) {
  return request.cookies.get(TOM_SESSION_COOKIE_NAME)?.value ?? null
}

export async function getCurrentUserFromRequest(request: NextRequest, refresh = false) {
  const sessionId = getSessionIdFromRequest(request)
  if (!sessionId) return null

  if (refresh) {
    const touched = await touchSession(sessionId)
    if (!touched) return null
  }

  return getCurrentUserFromSession(sessionId)
}

export function setSessionCookie(
  request: NextRequest,
  response: NextResponse,
  sessionId: string,
  maxAgeSeconds = TOM_SESSION_COOKIE_MAX_AGE_SECONDS
) {
  response.cookies.set({
    name: TOM_SESSION_COOKIE_NAME,
    value: sessionId,
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecureRequest(request),
    path: '/',
    maxAge: maxAgeSeconds,
  })
}

export function clearSessionCookie(request: NextRequest, response: NextResponse) {
  response.cookies.set({
    name: TOM_SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecureRequest(request),
    path: '/',
    expires: new Date(0),
  })
}
