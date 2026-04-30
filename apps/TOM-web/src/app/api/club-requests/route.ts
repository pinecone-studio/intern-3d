import type { NextRequest } from 'next/server'

import { requireAdmin, requireRole } from '@/lib/tom-api-auth'
import { badRequest, forbidden, ok, serverError } from '@/lib/tom-http'
import { getUser, listClubRequests, upsertClubRequest } from '@/lib/tom-db'
import { parseClubRequestInput } from '@/lib/tom-validators'


export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (auth.response) return auth.response

    const { searchParams } = new URL(request.url)
    const requests = await listClubRequests({
      requestStatus: searchParams.get('requestStatus'),
      clubStatus: searchParams.get('clubStatus'),
      teacher: searchParams.get('teacher'),
      q: searchParams.get('q'),
    })

    return ok({ requests })
  } catch (error) {
    return serverError('Failed to load club requests.', String(error))
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, 'student', { activeOnly: true })
    if (auth.response) return auth.response

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const input = parseClubRequestInput(body)
    if (!input) return badRequest('Club request name is required.')

    const teacherId = typeof body.teacherId === 'string' ? body.teacherId.trim() : ''
    if (!teacherId) return badRequest('teacherId is required.')

    const teacher = await getUser(teacherId)
    if (!teacher || teacher.role !== 'teacher') {
      return badRequest('Selected teacher was not found.')
    }
    if (teacher.accountStatus !== 'active') {
      return forbidden('Selected teacher account is not active.')
    }

    const clubRequest = await upsertClubRequest({
      clubName: input.clubName,
      teacherName: teacher.teacherProfileName || teacher.name,
      createdBy: auth.user.id,
      interestCount: 0,
      studentLimit: input.studentLimit,
      gradeRange: input.gradeRange,
      allowedDays: input.allowedDays,
      startDate: input.startDate,
      endDate: input.endDate,
      note: input.note,
      requestStatus: 'pending',
      clubStatus: 'pending',
      flaggedReason: null,
    })
    return ok({ request: clubRequest }, { status: 201 })
  } catch (error) {
    return serverError('Failed to create club request.', String(error))
  }
}
