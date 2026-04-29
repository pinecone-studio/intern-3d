import { NextRequest } from 'next/server'

import { getCurrentUserFromRequest } from '@/lib/tom-auth'
import {
  createEventPost,
  getEvent,
  listEventPostCommentsByPostIds,
  listEventPosts,
} from '@/lib/tom-db'
import {
  badRequest,
  forbidden,
  notFound,
  ok,
  serverError,
  unauthorized,
} from '@/lib/tom-http'

type Params = { params: Promise<{ eventId: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const currentUser = await getCurrentUserFromRequest(request, true)
    if (!currentUser) return unauthorized('Session not found.')

    const { eventId } = await params
    const event = await getEvent(eventId)
    if (!event) return notFound('Event олдсонгүй.')

    const posts = await listEventPosts(eventId, currentUser.id)
    const comments = await listEventPostCommentsByPostIds(posts.map((post) => post.id))
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
      event,
      posts: posts.map((post) => ({
        ...post,
        comments: commentsByPostId[post.id] ?? [],
      })),
    })
  } catch (error) {
    return serverError('Failed to load event posts.', String(error))
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const currentUser = await getCurrentUserFromRequest(request, true)
    if (!currentUser) return unauthorized('Session not found.')
    if (currentUser.role !== 'admin') {
      return forbidden('Only admins can create event posts.')
    }
    if (currentUser.accountStatus !== 'active') {
      return forbidden('Only active accounts can create event posts.')
    }

    const { eventId } = await params
    const event = await getEvent(eventId)
    if (!event) return notFound('Event олдсонгүй.')

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const content = typeof body.body === 'string' ? body.body.trim() : ''

    if (!content) return badRequest('Post бичвэр хоосон байна.')

    const post = await createEventPost({
      eventId,
      authorId: currentUser.id,
      title,
      body: content,
    })
    if (!post) return serverError('Failed to create event post.')

    return ok({ post }, { status: 201 })
  } catch (error) {
    return serverError('Failed to create event post.', String(error))
  }
}

