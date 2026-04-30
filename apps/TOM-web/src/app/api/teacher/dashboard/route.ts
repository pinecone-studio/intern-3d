import { NextRequest } from 'next/server'

import { getCurrentUserFromRequest } from '@/lib/tom-auth'
import { listClubRequests, listClubs, listEvents } from '@/lib/tom-db'
import { forbidden, ok, serverError, unauthorized } from '@/lib/tom-http'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromRequest(request, true)
    if (!currentUser) return unauthorized('Session not found.')
    if (currentUser.role !== 'teacher') {
      return forbidden('Only teachers can access the teacher dashboard.')
    }

    const teacherScopeName = currentUser.teacherProfileName || currentUser.name
    const [requests, clubs, events] = await Promise.all([
      listClubRequests({
        requestStatus: 'pending',
        teacher: teacherScopeName,
      }),
      listClubs({
        teacher: teacherScopeName,
      }),
      listEvents({
        createdBy: teacherScopeName,
      }),
    ])
    const thresholdReachedRequests = requests.filter(
      (request) => request.interestCount >= 7 || request.interestCount >= request.studentLimit
    )
    const priorityRequests = thresholdReachedRequests.slice(0, 3)
    const upcomingEvents = events
      .filter((event) => event.status === 'upcoming' || event.status === 'ongoing')
      .slice(0, 3)

    return ok({
      user: currentUser,
      teacherScopeName,
      requests,
      clubs,
      priorityRequests,
      upcomingEvents,
      summary: {
        pendingRequests: requests.length,
        thresholdReachedRequests: thresholdReachedRequests.length,
        upcomingEvents: upcomingEvents.length,
      },
    })
  } catch (error) {
    return serverError('Failed to load teacher dashboard.', String(error))
  }
}
