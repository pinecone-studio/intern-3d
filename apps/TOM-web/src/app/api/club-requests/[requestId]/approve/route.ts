import type { NextRequest } from 'next/server'

import { canManageTeacherOwnedResource, requireApiUser } from '@/lib/tom-api-auth'
import { forbidden, notFound, ok, serverError } from '@/lib/tom-http'
import { approveClubRequest, getClubRequest } from '@/lib/tom-db'


export async function POST(request: NextRequest, context: { params: Promise<{ requestId: string }> }) {
  try {
    const auth = await requireApiUser(request, ['admin', 'teacher'], { activeOnly: true })
    if (auth.response) return auth.response

    const { requestId } = await context.params
    const clubRequest = await getClubRequest(requestId)
    if (!clubRequest) return notFound('Club request not found.')
    if (!canManageTeacherOwnedResource(auth.user, clubRequest.teacherName)) {
      return forbidden('Only admins or the assigned teacher can approve this request.')
    }

    const result = await approveClubRequest(requestId)
    if (!result) return notFound('Club request not found.')

    return ok(result)
  } catch (error) {
    return serverError('Failed to approve club request.', String(error))
  }
}
