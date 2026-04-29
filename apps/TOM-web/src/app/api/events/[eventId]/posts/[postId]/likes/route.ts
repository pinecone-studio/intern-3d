import { NextRequest } from 'next/server'

import { getCurrentUserFromRequest } from '@/lib/tom-auth'
import { getEvent, getEventPost, toggleEventPostLike } from '@/lib/tom-db'
import {
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
      return forbidden('Only students, teachers and admins can like posts.')
    }
    if (currentUser.accountStatus !== 'active') {
      return forbidden('Only active accounts can like posts.')
    }

    const { eventId, postId } = await params
    const event = await getEvent(eventId)
    if (!event) return notFound('Event олдсонгүй.')

    const post = await getEventPost(postId)
    if (!post || post.eventId !== eventId) return notFound('Post олдсонгүй.')

    const result = await toggleEventPostLike({ postId, userId: currentUser.id })
    if (!result) return serverError('Failed to toggle like.')

    return ok(result)
  } catch (error) {
    return serverError('Failed to toggle like.', String(error))
  }
}

