export const TIMELINE_SESSION_COOKIE = 'timeline_user_id'
export const TIMELINE_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

export function getTimelineSessionUserIdFromCookieHeader(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null

  for (const entry of cookieHeader.split(';')) {
    const [rawName, ...rawValueParts] = entry.trim().split('=')
    if (rawName !== TIMELINE_SESSION_COOKIE) continue

    const rawValue = rawValueParts.join('=').trim()
    return rawValue ? decodeURIComponent(rawValue) : null
  }

  return null
}

export function getTimelineSessionUserIdFromRequest(request: Request): string | null {
  return getTimelineSessionUserIdFromCookieHeader(request.headers.get('cookie'))
}
