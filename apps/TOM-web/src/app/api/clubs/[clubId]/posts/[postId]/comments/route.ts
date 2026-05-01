import { NextRequest } from 'next/server'

import { getCurrentUserFromRequest } from '@/lib/tom-auth'
import { createClubPostComment, getClub, getClubPost } from '@/lib/tom-db'
import {
  badRequest,
  forbidden,
  notFound,
  ok,
  serverError,
  unauthorized,
} from '@/lib/tom-http'

type Params = { params: Promise<{ clubId: string; postId: string }> }

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

    const { clubId, postId } = await params
    const club = await getClub(clubId)
    if (!club) return notFound('Club олдсонгүй.')

    const post = await getClubPost(postId)
    if (!post || post.clubId !== clubId) return notFound('Post олдсонгүй.')

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const content = typeof body.body === 'string' ? body.body.trim() : ''
    if (!content) return badRequest('Comment хоосон байна.')

    const comment = await createClubPostComment({
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

