import type { NextRequest } from 'next/server'

import { requireAdmin } from '@/lib/tom-api-auth'
import { notFound, ok, serverError } from '@/lib/tom-http'
import { approveClubRequest } from '@/lib/tom-db'


export async function POST(request: NextRequest, context: { params: Promise<{ requestId: string }> }) {
  try {
    const auth = await requireAdmin(request)
    if (auth.response) return auth.response

    const { requestId } = await context.params
    const result = await approveClubRequest(requestId)
    if (!result) return notFound('Club request not found.')

    return ok(result)
  } catch (error) {
    return serverError('Failed to approve club request.', String(error))
  }
}
