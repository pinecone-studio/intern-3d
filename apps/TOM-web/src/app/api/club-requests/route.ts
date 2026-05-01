import type { NextRequest } from 'next/server'

import { requireAdmin, requireRole } from '@/lib/tom-api-auth'
import { badRequest, forbidden, ok, serverError } from '@/lib/tom-http'
import { getUser, listClubRequests, upsertClubRequest } from '@/lib/tom-db'
import { parseClubRequestInput } from '@/lib/tom-validators'

function formatLocalIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function isIsoDate(value: string | undefined): value is string {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value))
}

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
    const auth = await requireRole(request, ['student', 'admin'], { activeOnly: true })
    if (auth.response) return auth.response

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const input = parseClubRequestInput(body)
    if (!input) return badRequest('Club request name is required.')

    const clubName = input.clubName.trim()
    if (clubName.length < 3) return badRequest('Club name must be at least 3 characters.')
    if (clubName.length > 100) return badRequest('Club name must be at most 100 characters.')

    const startDate = input.startDate
    const endDate = input.endDate
    const today = formatLocalIsoDate(new Date())

    if (!isIsoDate(startDate) || !isIsoDate(endDate)) {
      return badRequest('Start date and end date are required.')
    }
    if (startDate < today) return badRequest('Start date cannot be in the past.')
    if (endDate <= startDate) return badRequest('End date must be after start date.')

    const existingRequests = await listClubRequests({ q: clubName })
    const duplicate = existingRequests.find(
      (r) => r.clubName.trim().toLowerCase() === clubName.toLowerCase()
    )
    if (duplicate) return badRequest('A club request with this name already exists.')

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
      clubName,
      teacherName: teacher.teacherProfileName || teacher.name,
      createdBy: auth.user.id,
      interestCount: auth.user.role === 'admin' ? input.interestCount : 0,
      studentLimit: input.studentLimit,
      gradeRange: input.gradeRange,
      allowedDays: input.allowedDays,
      startDate,
      endDate,
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
