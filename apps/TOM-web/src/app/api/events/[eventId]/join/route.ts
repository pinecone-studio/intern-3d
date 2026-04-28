import { NextRequest } from 'next/server'

import { getCurrentUserFromRequest } from '@/lib/tom-auth'
import { checkAndAwardBadges, getEvent, grantXp, isUserJoinedEvent, joinEvent, leaveEvent } from '@/lib/tom-db'
import { forbidden, notFound, ok, serverError, unauthorized } from '@/lib/tom-http'


type Params = { params: Promise<{ eventId: string }> }
const EVENT_DEFAULT_CAPACITY = 30

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const currentUser = await getCurrentUserFromRequest(request, true)
    if (!currentUser) return unauthorized('Session not found.')
    if (currentUser.role !== 'student') {
      return forbidden('Only students can join events.')
    }
    if (currentUser.accountStatus !== 'active') {
      return forbidden('Only active accounts can join events.')
    }

    const { eventId } = await params
    const event = await getEvent(eventId)
    if (!event) return notFound('Event олдсонгүй.')
    if (!['upcoming', 'ongoing'].includes(event.status)) {
      return forbidden('Энэ event-д одоо нэгдэх боломжгүй байна.')
    }
    if (event.participantCount >= EVENT_DEFAULT_CAPACITY) {
      return forbidden('Суудал дүүрсэн байна.')
    }

    const alreadyJoined = await isUserJoinedEvent(eventId, currentUser.id)
    if (alreadyJoined) {
      return ok({
        ok: true,
        joined: true,
        message: 'Та аль хэдийн энэ event-д нэгдсэн байна.',
      })
    }

    await joinEvent(eventId, currentUser.id)

    await grantXp(currentUser.id, 10, `${event.title} event-д нэгдэв`, 'event')
    const awarded = await checkAndAwardBadges(currentUser.id)
    const nextEvent = await getEvent(eventId)

    return ok({
      ok: true,
      joined: true,
      participantCount: nextEvent?.participantCount ?? event.participantCount + 1,
      awardedBadges: awarded,
      gainedXp: 10,
    })
  } catch (error) {
    return serverError('Event-д нэгдэж чадсангүй.', error instanceof Error ? error.message : error)
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const currentUser = await getCurrentUserFromRequest(request, true)
    if (!currentUser) return unauthorized('Session not found.')
    if (currentUser.role !== 'student') {
      return forbidden('Only students can leave events.')
    }

    const { eventId } = await params
    const event = await getEvent(eventId)
    if (!event) return notFound('Event олдсонгүй.')

    const alreadyJoined = await isUserJoinedEvent(eventId, currentUser.id)
    if (!alreadyJoined) {
      return ok({ ok: true, joined: false, message: 'Та энэ event-д бүртгэлгүй байна.' })
    }

    await leaveEvent(eventId, currentUser.id)
    const nextEvent = await getEvent(eventId)
    return ok({
      ok: true,
      joined: false,
      participantCount: Math.max(0, (nextEvent?.participantCount ?? event.participantCount) - 1),
    })
  } catch (error) {
    return serverError('Event-ээс гарч чадсангүй.', error instanceof Error ? error.message : error)
  }
}
