import type { NextRequest } from 'next/server'

import { requireAdmin, requireAuth } from '@/lib/tom-api-auth'
import { badRequest, forbidden, notFound, ok, serverError } from '@/lib/tom-http'
import { deleteUser, getUser, upsertUser } from '@/lib/tom-db'
import { parseUserInput } from '@/lib/tom-validators'


export async function GET(request: NextRequest, context: { params: Promise<{ userId: string }> }) {
  try {
    const auth = await requireAuth(request)
    if (auth.response) return auth.response

    const { userId } = await context.params
    if (auth.user.role !== 'admin' && auth.user.id !== userId) {
      return forbidden('You can only access your own user record.')
    }

    const user = await getUser(userId)
    if (!user) return notFound('User not found.')

    return ok({ user })
  } catch (error) {
    return serverError('Failed to load user.', String(error))
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ userId: string }> }) {
  try {
    const auth = await requireAdmin(request)
    if (auth.response) return auth.response

    const { userId } = await context.params
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const current = await getUser(userId)
    if (!current) return notFound('User not found.')

    const merged = parseUserInput({
      ...current,
      ...body,
      name: body.name ?? current.name,
      email: body.email ?? current.email,
    })
    if (!merged) return badRequest('User name and email are required.')

    const user = await upsertUser(merged, userId)
    return ok({ user })
  } catch (error) {
    return serverError('Failed to update user.', String(error))
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ userId: string }> }) {
  try {
    const auth = await requireAdmin(request)
    if (auth.response) return auth.response

    const { userId } = await context.params
    const removed = await deleteUser(userId)
    if (!removed) return notFound('User not found.')

    return ok({ ok: true })
  } catch (error) {
    return serverError('Failed to delete user.', String(error))
  }
}
