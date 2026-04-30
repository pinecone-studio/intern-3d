import type { NextRequest } from 'next/server'

import { canManageTeacherOwnedResource, requireAdmin, requireApiUser } from '@/lib/tom-api-auth'
import { badRequest, forbidden, notFound, ok, serverError } from '@/lib/tom-http'
import { deleteClub, getClub, upsertClub } from '@/lib/tom-db'
import { parseClubInput } from '@/lib/tom-validators'


export async function GET(_request: Request, context: { params: Promise<{ clubId: string }> }) {
  try {
    const { clubId } = await context.params
    const club = await getClub(clubId)
    if (!club) return notFound('Club not found.')

    return ok({ club })
  } catch (error) {
    return serverError('Failed to load club.', String(error))
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ clubId: string }> }) {
  try {
    const auth = await requireApiUser(request, ['admin', 'teacher'], { activeOnly: true })
    if (auth.response) return auth.response

    const { clubId } = await context.params
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const current = await getClub(clubId)
    if (!current) return notFound('Club not found.')
    if (!canManageTeacherOwnedResource(auth.user, current.teacherName)) {
      return forbidden('Only admins or the assigned teacher can update this club.')
    }

    const merged =
      auth.user.role === 'teacher'
        ? parseClubInput({
            ...current,
            ...body,
            name: body.name ?? current.name,
            teacherName: current.teacherName,
            createdBy: current.createdBy,
            interestCount: current.interestCount,
            memberCount: current.memberCount,
            verified: current.verified,
          })
        : parseClubInput({ ...current, ...body, name: body.name ?? current.name })

    if (!merged) return badRequest('Club name is required.')

    const club = await upsertClub(merged, clubId)
    return ok({ club })
  } catch (error) {
    return serverError('Failed to update club.', String(error))
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ clubId: string }> }) {
  try {
    const auth = await requireAdmin(request)
    if (auth.response) return auth.response

    const { clubId } = await context.params
    const deleted = await deleteClub(clubId)
    if (!deleted) return notFound('Club not found.')

    return ok({ ok: true })
  } catch (error) {
    return serverError('Failed to delete club.', String(error))
  }
}
