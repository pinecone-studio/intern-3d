import { NextRequest } from 'next/server'

import { canManageTeacherOwnedResource } from '@/lib/tom-api-auth'
import { getCurrentUserFromRequest } from '@/lib/tom-auth'
import {
  deleteEventPostComment,
  getEvent,
  getEventPost,
  getEventPostComment,
} from '@/lib/tom-db'
import { forbidden, notFound, ok, serverError, unauthorized } from '@/lib/tom-http'

type Params = {
  params: Promise<{ eventId: string; postId: string; commentId: string }>
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const currentUser = await getCurrentUserFromRequest(request, true)
    if (!currentUser) return unauthorized('Session not found.')
    if (!['student', 'teacher', 'admin'].includes(currentUser.role)) {
      return forbidden('Only students, teachers and admins can delete comments.')
    }
    if (currentUser.accountStatus !== 'active') {
      return forbidden('Only active accounts can delete comments.')
    }

    const { eventId, postId, commentId } = await params
    const event = await getEvent(eventId)
    if (!event) return notFound('Event олдсонгүй.')

    const post = await getEventPost(postId)
    if (!post || post.eventId !== eventId) return notFound('Post олдсонгүй.')

    const comment = await getEventPostComment(commentId)
    if (!comment || comment.postId !== postId) return notFound('Comment олдсонгүй.')

    const canModerate =
      currentUser.role === 'admin' ||
      (currentUser.role === 'teacher' &&
        canManageTeacherOwnedResource(currentUser, event.createdBy))

    if (!canModerate && comment.author.id !== currentUser.id) {
      return forbidden('You do not have permission to delete this comment.')
    }

    await deleteEventPostComment(commentId)
    return ok({ ok: true })
  } catch (error) {
    return serverError('Failed to delete event comment.', String(error))
  }
}

