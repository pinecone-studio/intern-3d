import { NextRequest } from 'next/server'

import { canManageTeacherOwnedResource } from '@/lib/tom-api-auth'
import { getCurrentUserFromRequest } from '@/lib/tom-auth'
import {
  deleteClubPostComment,
  getClub,
  getClubPost,
  getClubPostComment,
} from '@/lib/tom-db'
import { forbidden, notFound, ok, serverError, unauthorized } from '@/lib/tom-http'

type Params = {
  params: Promise<{ clubId: string; postId: string; commentId: string }>
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

    const { clubId, postId, commentId } = await params
    const club = await getClub(clubId)
    if (!club) return notFound('Club олдсонгүй.')

    const post = await getClubPost(postId)
    if (!post || post.clubId !== clubId) return notFound('Post олдсонгүй.')

    const comment = await getClubPostComment(commentId)
    if (!comment || comment.postId !== postId) return notFound('Comment олдсонгүй.')

    const canModerate =
      currentUser.role === 'admin' ||
      (currentUser.role === 'teacher' &&
        canManageTeacherOwnedResource(currentUser, club.teacherName))

    if (!canModerate && comment.author.id !== currentUser.id) {
      return forbidden('You do not have permission to delete this comment.')
    }

    await deleteClubPostComment(commentId)
    return ok({ ok: true })
  } catch (error) {
    return serverError('Failed to delete club comment.', String(error))
  }
}

