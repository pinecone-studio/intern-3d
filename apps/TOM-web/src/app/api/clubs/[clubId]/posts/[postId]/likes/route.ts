import { NextRequest } from 'next/server'

import { getCurrentUserFromRequest } from '@/lib/tom-auth'
import { getClub, getClubPost, toggleClubPostLike } from '@/lib/tom-db'
import {
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
      return forbidden('Only students, teachers and admins can like posts.')
    }
    if (currentUser.accountStatus !== 'active') {
      return forbidden('Only active accounts can like posts.')
    }

    const { clubId, postId } = await params
    const club = await getClub(clubId)
    if (!club) return notFound('Club олдсонгүй.')

    const post = await getClubPost(postId)
    if (!post || post.clubId !== clubId) return notFound('Post олдсонгүй.')

    const result = await toggleClubPostLike({ postId, userId: currentUser.id })
    if (!result) return serverError('Failed to toggle like.')

    return ok(result)
  } catch (error) {
    return serverError('Failed to toggle like.', String(error))
  }
}

