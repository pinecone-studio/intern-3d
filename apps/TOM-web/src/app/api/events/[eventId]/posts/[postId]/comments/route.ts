import { NextRequest } from 'next/server'

import { getCurrentUserFromRequest } from '@/lib/tom-auth'
import { createEventPostComment, getEvent, getEventPost } from '@/lib/tom-db'
import {
  badRequest,
  forbidden,
  notFound,
  ok,
  serverError,
  unauthorized,
} from '@/lib/tom-http'

type Params = { params: Promise<{ eventId: string; postId: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const currentUser = await getCurrentUserFromRequest(request, true)
    if (!currentUser) return unauthorized('Session not found.')
    if (!['student', 'teacher', 'admin'].includes(currentUser.role)) {
      return forbidden('Only students, teachers and admins can comment.')
    }
    if (currentUser.accountStatus !== 'active') {
      return forbidden('Only active accounts can comment.')
    }

    const { eventId, postId } = await params
    const event = await getEvent(eventId)
    if (!event) return notFound('Event олдсонгүй.')

    const post = await getEventPost(postId)
    if (!post || post.eventId !== eventId) return notFound('Post олдсонгүй.')

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const content = typeof body.body === 'string' ? body.body.trim() : ''
    if (!content) return badRequest('Comment хоосон байна.')

    const comment = await createEventPostComment({
      postId,
      authorId: currentUser.id,
      body: content,
    })
    if (!comment) return serverError('Failed to create comment.')

    return ok({ comment }, { status: 201 })
  } catch (error) {
    return serverError('Failed to create comment.', String(error))
  }
}

