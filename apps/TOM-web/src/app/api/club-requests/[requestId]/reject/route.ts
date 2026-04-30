import type { NextRequest } from 'next/server'

import { canManageTeacherOwnedResource, requireApiUser } from '@/lib/tom-api-auth'
import { forbidden, notFound, ok, serverError } from '@/lib/tom-http'
import { getClubRequest, rejectClubRequest } from '@/lib/tom-db'


export async function POST(request: NextRequest, context: { params: Promise<{ requestId: string }> }) {
  try {
    const auth = await requireApiUser(request, ['admin', 'teacher'], { activeOnly: true })
    if (auth.response) return auth.response

    const { requestId } = await context.params
    const current = await getClubRequest(requestId)
    if (!current) return notFound('Club request not found.')
    if (!canManageTeacherOwnedResource(auth.user, current.teacherName)) {
      return forbidden('Only admins or the assigned teacher can reject this request.')
    }

    const clubRequest = await rejectClubRequest(requestId)
    if (!clubRequest) return notFound('Club request not found.')

    return ok({ request: clubRequest })
  } catch (error) {
    return serverError('Failed to reject club request.', String(error))
  }
}
