import { NextRequest } from 'next/server'

import { canManageTeacherOwnedResource } from '@/lib/tom-api-auth'
import { getCurrentUserFromRequest } from '@/lib/tom-auth'
import { deleteClubPost, getClub, getClubPost } from '@/lib/tom-db'
import { forbidden, notFound, ok, serverError, unauthorized } from '@/lib/tom-http'

type Params = { params: Promise<{ clubId: string; postId: string }> }

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const currentUser = await getCurrentUserFromRequest(request, true)
    if (!currentUser) return unauthorized('Session not found.')
    if (!['admin', 'teacher'].includes(currentUser.role)) {
      return forbidden('Only admins and assigned teachers can delete club posts.')
    }
    if (currentUser.accountStatus !== 'active') {
      return forbidden('Only active accounts can delete club posts.')
    }

    const { clubId, postId } = await params
    const club = await getClub(clubId)
    if (!club) return notFound('Club олдсонгүй.')

    const post = await getClubPost(postId)
    if (!post || post.clubId !== clubId) return notFound('Post олдсонгүй.')

    if (!canManageTeacherOwnedResource(currentUser, club.teacherName)) {
      return forbidden('Only admins or the assigned teacher can delete club posts.')
    }

    await deleteClubPost(postId)

    return ok({ ok: true })
  } catch (error) {
    return serverError('Failed to delete club post.', String(error))
  }
}

