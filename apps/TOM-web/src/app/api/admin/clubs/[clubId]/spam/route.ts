import type { NextRequest } from 'next/server'

import { requireAdmin } from '@/lib/tom-api-auth'
import { getClub, upsertClub } from '@/lib/tom-db'
import { badRequest, notFound, ok, serverError } from '@/lib/tom-http'

export async function POST(request: NextRequest, context: { params: Promise<{ clubId: string }> }) {
  try {
    const auth = await requireAdmin(request)
    if (auth.response) return auth.response

    const { clubId } = await context.params
    const club = await getClub(clubId)
    if (!club) return notFound('Club not found.')

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const reason = typeof body.reason === 'string' ? body.reason.trim() : 'Flagged as spam'
    if (!reason) return badRequest('Reason is required.')

    const updated = await upsertClub({ ...club, status: 'archived' }, clubId)
    return ok({ club: updated, flaggedReason: reason })
  } catch (error) {
    return serverError('Failed to flag club.', String(error))
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ clubId: string }> }) {
  try {
    const auth = await requireAdmin(request)
    if (auth.response) return auth.response

    const { clubId } = await context.params
    const club = await getClub(clubId)
    if (!club) return notFound('Club not found.')

    const updated = await upsertClub({ ...club, status: 'active' }, clubId)
    return ok({ club: updated })
  } catch (error) {
    return serverError('Failed to unflag club.', String(error))
  }
}
