import { NextRequest } from 'next/server'

import { getCurrentUserFromRequest } from '@/lib/tom-auth'
import { listClubRequests, listClubs, upsertClubRequest } from '@/lib/tom-db'
import { badRequest, forbidden, ok, serverError, unauthorized } from '@/lib/tom-http'
import { parseClubRequestInput } from '@/lib/tom-validators'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromRequest(request, true)
    if (!currentUser) return unauthorized('Session not found.')
    if (currentUser.role !== 'teacher') {
      return forbidden('Only teachers can access teacher clubs.')
    }

    const { searchParams } = new URL(request.url)
    const teacherScopeName = currentUser.teacherProfileName || currentUser.name
    const q = searchParams.get('q')

    const [clubs, requests] = await Promise.all([
      listClubs({
        teacher: teacherScopeName,
        q,
      }),
      listClubRequests({
        requestStatus: 'pending',
        teacher: teacherScopeName,
        q,
      }),
    ])

    return ok({
      user: currentUser,
      teacherScopeName,
      clubs,
      requests,
    })
  } catch (error) {
    return serverError('Failed to load teacher clubs.', String(error))
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromRequest(request, true)
    if (!currentUser) return unauthorized('Session not found.')
    if (currentUser.role !== 'teacher') {
      return forbidden('Only teachers can create club requests.')
    }

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const input = parseClubRequestInput(body)
    if (!input) return badRequest('Club name is required.')

    const teacherScopeName = currentUser.teacherProfileName || currentUser.name
    const clubRequest = await upsertClubRequest(
      {
        ...input,
        teacherName: teacherScopeName,
        createdBy: teacherScopeName,
        requestStatus: 'pending',
        clubStatus: 'pending',
        flaggedReason: null,
      },
      typeof body.id === 'string' ? body.id : undefined
    )

    return ok({ request: clubRequest }, { status: 201 })
  } catch (error) {
    return serverError('Failed to create club request.', String(error))
  }
}
