import { NextRequest } from 'next/server'

import { getCurrentUserFromRequest } from '@/lib/tom-auth'
import { autoJoinAllUsers, listEvents, upsertEvent } from '@/lib/tom-db'
import { badRequest, forbidden, ok, serverError, unauthorized } from '@/lib/tom-http'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromRequest(request, true)
    if (!currentUser) return unauthorized('Session not found.')
    if (currentUser.role !== 'teacher') {
      return forbidden('Only teachers can access teacher events.')
    }

    const { searchParams } = new URL(request.url)
    const teacherScopeName = currentUser.teacherProfileName || currentUser.name
    const status = searchParams.get('status')
    const q = searchParams.get('q')
    const events = await listEvents({
      status,
      createdBy: teacherScopeName,
      q,
    })

    return ok({
      user: currentUser,
      teacherScopeName,
      events,
    })
  } catch (error) {
    return serverError('Failed to load teacher events.', String(error))
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromRequest(request, true)
    if (!currentUser) return unauthorized('Session not found.')
    if (currentUser.role !== 'teacher') {
      return forbidden('Only teachers can create teacher events.')
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const eventDate = typeof body.eventDate === 'string' ? body.eventDate.trim() : ''

    if (!title) return badRequest('title заавал оруулна уу.')
    if (!eventDate) return badRequest('eventDate заавал оруулна уу.')

    const teacherScopeName = currentUser.teacherProfileName || currentUser.name
    const event = await upsertEvent({
      title,
      eventDate,
      description: typeof body.description === 'string' ? body.description : '',
      location: typeof body.location === 'string' ? body.location : '',
      startTime: typeof body.startTime === 'string' ? body.startTime : '',
      endTime: typeof body.endTime === 'string' ? body.endTime : '',
      status: 'upcoming',
      createdBy: teacherScopeName,
    })

    await autoJoinAllUsers(event.id)

    return ok({ event }, { status: 201 })
  } catch (error) {
    return serverError('Teacher event үүсгэж чадсангүй.', error instanceof Error ? error.message : error)
  }
}
