import { NextRequest } from 'next/server'

import { canManageTeacherOwnedResource } from '@/lib/tom-api-auth'
import { getCurrentUserFromRequest } from '@/lib/tom-auth'
import { deleteEventPost, getEvent, getEventPost } from '@/lib/tom-db'
import { forbidden, notFound, ok, serverError, unauthorized } from '@/lib/tom-http'

type Params = { params: Promise<{ eventId: string; postId: string }> }

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const currentUser = await getCurrentUserFromRequest(request, true)
    if (!currentUser) return unauthorized('Session not found.')
    if (!['admin', 'teacher'].includes(currentUser.role)) {
      return forbidden('Only admins and assigned teachers can delete event posts.')
    }
    if (currentUser.accountStatus !== 'active') {
      return forbidden('Only active accounts can delete event posts.')
    }

    const { eventId, postId } = await params
    const event = await getEvent(eventId)
    if (!event) return notFound('Event олдсонгүй.')

    const post = await getEventPost(postId)
    if (!post || post.eventId !== eventId) return notFound('Post олдсонгүй.')

    if (!canManageTeacherOwnedResource(currentUser, event.createdBy)) {
      return forbidden('Only admins or the event owner can delete event posts.')
    }

    await deleteEventPost(postId)

    return ok({ ok: true })
  } catch (error) {
    return serverError('Failed to delete event post.', String(error))
  }
}

