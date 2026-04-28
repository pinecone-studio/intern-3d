import { NextRequest } from 'next/server'

import { getCurrentUserFromRequest } from '@/lib/tom-auth'
import { listClubRequests, listClubs } from '@/lib/tom-db'
import { forbidden, ok, serverError, unauthorized } from '@/lib/tom-http'

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
