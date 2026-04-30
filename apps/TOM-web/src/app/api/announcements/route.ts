import type { NextRequest } from 'next/server'

import { requireApiUser } from '@/lib/tom-api-auth'
import { createAnnouncement, listAnnouncements } from '@/lib/tom-db'
import { badRequest, ok, serverError } from '@/lib/tom-http'
import type { AnnouncementType } from '@/lib/tom-types'

const validTypes: AnnouncementType[] = ['global', 'club', 'event']

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') ?? undefined
    const announcements = await listAnnouncements(type)
    return ok({ announcements })
  } catch (error) {
    return serverError('Failed to load announcements.', String(error))
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiUser(request, ['teacher', 'admin'], { activeOnly: true })
    if (auth.response) return auth.response

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const content = typeof body.content === 'string' ? body.content.trim() : ''
    const type: AnnouncementType =
      typeof body.type === 'string' && validTypes.includes(body.type as AnnouncementType)
        ? (body.type as AnnouncementType)
        : 'global'

    if (!title) return badRequest('title is required.')

    if (auth.user.role === 'teacher' && type === 'global') {
      return badRequest('Teachers can only create club or event announcements.')
    }

    const clubId = typeof body.clubId === 'string' ? body.clubId : null
    const eventId = typeof body.eventId === 'string' ? body.eventId : null

    const announcement = await createAnnouncement({ type, title, content, clubId, eventId }, auth.user.id)
    return ok({ announcement }, { status: 201 })
  } catch (error) {
    return serverError('Failed to create announcement.', String(error))
  }
}
