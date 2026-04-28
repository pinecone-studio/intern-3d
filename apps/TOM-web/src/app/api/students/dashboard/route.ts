import { NextRequest } from 'next/server'

import { getCurrentUserFromRequest } from '@/lib/tom-auth'
import {
  getUserXpTotal,
  listBadges,
  listClubMembershipsForUser,
  listEvents,
  listClubsByIds,
  listClubRequests,
  listEventsForUser,
  listUserBadges,
  listXpLogs,
} from '@/lib/tom-db'
import { forbidden, ok, serverError, unauthorized } from '@/lib/tom-http'

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUserFromRequest(request, true)
    if (!currentUser) return unauthorized('Session not found.')
    if (currentUser.role !== 'student') {
      return forbidden('Only students can access the student dashboard.')
    }

    const memberships = await listClubMembershipsForUser(currentUser.id)
    const joinedClubIds = memberships.map((membership) => membership.clubId)

    const [clubs, requests, events, allUpcomingEvents, xpTotal, xpLogs, userBadges, allBadges] = await Promise.all([
      listClubsByIds(joinedClubIds),
      listClubRequests({
        createdBy: currentUser.name,
      }),
      listEventsForUser(currentUser.id),
      listEvents({ status: 'upcoming' }),
      getUserXpTotal(currentUser.id),
      listXpLogs(currentUser.id),
      listUserBadges(currentUser.id),
      listBadges(),
    ])

    const activity = [
      ...requests.slice(0, 2).map((request) => ({
        id: `request-${request.id}`,
        type: 'club_request',
        title: `${request.clubName} хүсэлт ${request.requestStatus === 'approved' ? 'батлагдсан' : request.requestStatus === 'rejected' ? 'татгалзсан' : 'хүлээгдэж байна'}`,
        detail: `${request.teacherName} · ${request.updatedAt.slice(0, 10)}`,
        createdAt: request.updatedAt,
      })),
      ...events.slice(0, 2).map((event) => ({
        id: `event-${event.id}`,
        type: 'event',
        title: `${event.title} арга хэмжээнд бүртгэлтэй`,
        detail: `${event.eventDate}${event.startTime ? ` · ${event.startTime}` : ''}`,
        createdAt: event.updatedAt,
      })),
      ...xpLogs.slice(0, 4).map((log) => ({
        id: `xp-${log.id}`,
        type: 'xp',
        title: `${log.amount > 0 ? '+' : ''}${log.amount} XP`,
        detail: `${log.reason} · ${log.source}`,
        createdAt: log.createdAt,
      })),
      ...userBadges.slice(0, 3).map((item) => ({
        id: `badge-${item.id}`,
        type: 'badge',
        title: `${item.badge.icon} ${item.badge.name}`,
        detail: item.badge.description || 'Шинэ badge авлаа.',
        createdAt: item.awardedAt,
      })),
    ]
      .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
      .slice(0, 8)

    return ok({
      user: currentUser,
      joinedClubIds,
      clubs,
      requests,
      events,
      upcomingEvents: allUpcomingEvents,
      xp: {
        total: xpTotal,
        logs: xpLogs.slice(0, 20),
      },
      badges: {
        earned: userBadges,
        total: allBadges.length,
      },
      activity,
    })
  } catch (error) {
    return serverError('Failed to load student dashboard.', String(error))
  }
}
