import type { NextRequest } from 'next/server'

import { requireAuth } from '@/lib/tom-api-auth'
import {
  addClubInterest,
  countClubInterests,
  getClub,
  getClubInterest,
  removeClubInterest,
} from '@/lib/tom-db'
import { notFound, ok, serverError } from '@/lib/tom-http'

export async function GET(_request: NextRequest, context: { params: Promise<{ clubId: string }> }) {
  try {
    const { clubId } = await context.params
    const club = await getClub(clubId)
    if (!club) return notFound('Club not found.')
    const count = await countClubInterests(clubId)
    return ok({ clubId, count })
  } catch (error) {
    return serverError('Failed to get interest count.', String(error))
  }
}

export async function POST(request: NextRequest, context: { params: Promise<{ clubId: string }> }) {
  try {
    const auth = await requireAuth(request, { activeOnly: true })
    if (auth.response) return auth.response

    const { clubId } = await context.params
    const club = await getClub(clubId)
    if (!club) return notFound('Club not found.')

    const existing = await getClubInterest(auth.user.id, clubId)
    if (existing) {
      const count = await countClubInterests(clubId)
      return ok({ interest: existing, count })
    }

    const interest = await addClubInterest(auth.user.id, clubId)
    const count = await countClubInterests(clubId)
    return ok({ interest, count }, { status: 201 })
  } catch (error) {
    return serverError('Failed to add interest.', String(error))
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ clubId: string }> }) {
  try {
    const auth = await requireAuth(request, { activeOnly: true })
    if (auth.response) return auth.response

    const { clubId } = await context.params
    await removeClubInterest(auth.user.id, clubId)
    const count = await countClubInterests(clubId)
    return ok({ count })
  } catch (error) {
    return serverError('Failed to remove interest.', String(error))
  }
}
