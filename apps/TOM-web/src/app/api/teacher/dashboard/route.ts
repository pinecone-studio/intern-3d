import { NextRequest } from 'next/server'

import { getCurrentUserFromRequest } from '@/lib/tom-auth'
import { listClubRequests, listClubs } from '@/lib/tom-db'
import { forbidden, ok, serverError, unauthorized } from '@/lib/tom-http'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromRequest(request, true)
    if (!currentUser) return unauthorized('Session not found.')
    if (currentUser.role !== 'teacher') {
      return forbidden('Only teachers can access the teacher dashboard.')
    }

    const teacherScopeName = currentUser.teacherProfileName || currentUser.name
    const [requests, clubs] = await Promise.all([
      listClubRequests({
        requestStatus: 'pending',
        teacher: teacherScopeName,
      }),
      listClubs({
        teacher: teacherScopeName,
      }),
    ])

    return ok({
      user: currentUser,
      teacherScopeName,
      requests,
      clubs,
      summary: {
        pendingRequests: requests.length,
        thresholdReachedRequests: requests.filter((request) => request.interestCount >= 7).length,
      },
    })
  } catch (error) {
    return serverError('Failed to load teacher dashboard.', String(error))
  }
}
