import { NextRequest } from 'next/server'

import { canManageTeacherOwnedResource } from '@/lib/tom-api-auth'
import { getCurrentUserFromRequest } from '@/lib/tom-auth'
import {
  createClubPost,
  getClub,
  listClubPostCommentsByPostIds,
  listClubPosts,
} from '@/lib/tom-db'
import {
  badRequest,
  forbidden,
  notFound,
  ok,
  serverError,
  unauthorized,
} from '@/lib/tom-http'

type Params = { params: Promise<{ clubId: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const currentUser = await getCurrentUserFromRequest(request, true)
    if (!currentUser) return unauthorized('Session not found.')

    const { clubId } = await params
    const club = await getClub(clubId)
    if (!club) return notFound('Club олдсонгүй.')

    const posts = await listClubPosts(clubId, currentUser.id)
    const comments = await listClubPostCommentsByPostIds(posts.map((post) => post.id))
    const commentsByPostId = comments.reduce<Record<string, typeof comments>>((acc, comment) => {
      const bucket = acc[comment.postId]
      if (bucket) {
        bucket.push(comment)
      } else {
        acc[comment.postId] = [comment]
      }
      return acc
    }, {})

    return ok({
      club,
      posts: posts.map((post) => ({
        ...post,
        comments: commentsByPostId[post.id] ?? [],
      })),
    })
  } catch (error) {
    return serverError('Failed to load club posts.', String(error))
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const currentUser = await getCurrentUserFromRequest(request, true)
    if (!currentUser) return unauthorized('Session not found.')
    if (!['admin', 'teacher'].includes(currentUser.role)) {
      return forbidden('Only admins and assigned teachers can create club posts.')
    }
    if (currentUser.accountStatus !== 'active') {
      return forbidden('Only active accounts can create club posts.')
    }

    const { clubId } = await params
    const club = await getClub(clubId)
    if (!club) return notFound('Club олдсонгүй.')
    if (!canManageTeacherOwnedResource(currentUser, club.teacherName)) {
      return forbidden('Only admins or the assigned teacher can create club posts.')
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const content = typeof body.body === 'string' ? body.body.trim() : ''

    if (!content) return badRequest('Post бичвэр хоосон байна.')

    const post = await createClubPost({
      clubId,
      authorId: currentUser.id,
      title,
      body: content,
    })
    if (!post) return serverError('Failed to create club post.')

    return ok({ post }, { status: 201 })
  } catch (error) {
    return serverError('Failed to create club post.', String(error))
  }
}

