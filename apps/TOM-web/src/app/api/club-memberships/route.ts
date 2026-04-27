import { NextRequest } from 'next/server'

import { getCurrentUserFromRequest } from '@/lib/tom-auth'
import { getClub, joinClub, leaveClub, listClubMembershipsForUser } from '@/lib/tom-db'
import { badRequest, forbidden, notFound, ok, serverError, unauthorized } from '@/lib/tom-http'
import { parseClubMembershipInput } from '@/lib/tom-validators'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromRequest(request, true)
    if (!currentUser) return unauthorized('Session not found.')

    const memberships = await listClubMembershipsForUser(currentUser.id)
    return ok({
      memberships,
      joinedClubIds: memberships.map((membership) => membership.clubId),
    })
  } catch (error) {
    return serverError('Failed to load club memberships.', String(error))
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromRequest(request, true)
    if (!currentUser) return unauthorized('Session not found.')
    if (currentUser.role !== 'student') {
      return forbidden('Only students can join clubs.')
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const input = parseClubMembershipInput(body)
    if (!input) return badRequest('clubId is required.')

    const club = await getClub(input.clubId)
    if (!club) return notFound('Club not found.')
    if (club.status !== 'active') {
      return forbidden('Only active clubs can be joined.')
    }

    const membership = await joinClub(input.clubId, currentUser.id)
    const memberships = await listClubMembershipsForUser(currentUser.id)

    return ok({
      membership,
      joinedClubIds: memberships.map((entry) => entry.clubId),
    })
  } catch (error) {
    return serverError('Failed to join club.', String(error))
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromRequest(request, true)
    if (!currentUser) return unauthorized('Session not found.')
    if (currentUser.role !== 'student') {
      return forbidden('Only students can leave clubs.')
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const input = parseClubMembershipInput(body)
    if (!input) return badRequest('clubId is required.')

    const club = await getClub(input.clubId)
    if (!club) return notFound('Club not found.')

    await leaveClub(input.clubId, currentUser.id)
    const memberships = await listClubMembershipsForUser(currentUser.id)

    return ok({
      ok: true,
      joinedClubIds: memberships.map((entry) => entry.clubId),
    })
  } catch (error) {
    return serverError('Failed to leave club.', String(error))
  }
}
