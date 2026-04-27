import { NextRequest } from 'next/server'

import { getUser } from '@/lib/tom-db'
import { clearSessionCookie, getCurrentUserFromRequest, getSessionIdFromRequest, setSessionCookie } from '@/lib/tom-auth'
import { badRequest, forbidden, notFound, ok, unauthorized, serverError } from '@/lib/tom-http'
import { createSession, deleteExpiredSessions, deleteSession, getCurrentUserFromSession } from '@/lib/tom-session'
import { parseSessionLoginInput } from '@/lib/tom-validators'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromRequest(request, true)
    if (!currentUser) {
      const response = unauthorized('Session not found.')
      clearSessionCookie(request, response)
      return response
    }

    const response = ok({ user: currentUser })
    setSessionCookie(request, response, currentUser.sessionId)
    return response
  } catch (error) {
    return serverError('Failed to load current session.', String(error))
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const input = parseSessionLoginInput(body)
    if (!input) return badRequest('User id is required to create a session.')

    await deleteExpiredSessions()

    const user = await getUser(input.userId)
    if (!user) return notFound('User not found.')
    if (user.accountStatus === 'banned') {
      return forbidden('This account is banned and cannot sign in.')
    }

    const session = await createSession(user.id)
    const currentUser = await getCurrentUserFromSession(session.id)

    if (!currentUser) {
      return serverError('Failed to resolve current user after session creation.')
    }

    const response = ok({ user: currentUser }, { status: 201 })
    setSessionCookie(request, response, session.id)
    return response
  } catch (error) {
    return serverError('Failed to create session.', String(error))
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sessionId = getSessionIdFromRequest(request)
    if (sessionId) {
      await deleteSession(sessionId)
    }

    const response = ok({ ok: true })
    clearSessionCookie(request, response)
    return response
  } catch (error) {
    return serverError('Failed to clear session.', String(error))
  }
}
