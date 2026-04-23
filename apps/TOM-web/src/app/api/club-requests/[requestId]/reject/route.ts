import { notFound, ok, serverError } from '@/lib/tom-http'
import { rejectClubRequest } from '@/lib/tom-db'

export const runtime = 'edge'

export async function POST(_request: Request, context: { params: Promise<{ requestId: string }> }) {
  try {
    const { requestId } = await context.params
    const clubRequest = await rejectClubRequest(requestId)
    if (!clubRequest) return notFound('Club request not found.')

    return ok({ request: clubRequest })
  } catch (error) {
    return serverError('Failed to reject club request.', String(error))
  }
}
