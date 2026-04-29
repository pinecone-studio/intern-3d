import type { NextRequest } from 'next/server'

import { requireAdmin } from '@/lib/tom-api-auth'
import { autoJoinAllUsers, listEvents, upsertEvent } from '@/lib/tom-db'
import { badRequest, ok, serverError } from '@/lib/tom-http'


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const q = searchParams.get('q')
    const events = await listEvents({ status, q })
    return ok({ events })
  } catch (error) {
    return serverError('Events-г ачаалж чадсангүй.', error instanceof Error ? error.message : error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (auth.response) return auth.response

    const body = (await request.json()) as Record<string, unknown>

    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const eventDate = typeof body.eventDate === 'string' ? body.eventDate.trim() : ''

    if (!title) return badRequest('title заавал оруулна уу.')
    if (!eventDate) return badRequest('eventDate заавал оруулна уу.')

    const event = await upsertEvent({
      title,
      eventDate,
      description: typeof body.description === 'string' ? body.description : '',
      location: typeof body.location === 'string' ? body.location : '',
      startTime: typeof body.startTime === 'string' ? body.startTime : '',
      endTime: typeof body.endTime === 'string' ? body.endTime : '',
      status: 'upcoming',
      createdBy: typeof body.createdBy === 'string' ? body.createdBy : 'admin',
    })

    await autoJoinAllUsers(event.id)

    return ok({ event }, { status: 201 })
  } catch (error) {
    return serverError('Event үүсгэж чадсангүй.', error instanceof Error ? error.message : error)
  }
}
