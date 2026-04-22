import { notFound, ok, serverError } from '@/lib/tom-http'
import { approveClubRequest } from '@/lib/tom-db'

export async function POST(_request: Request, context: { params: Promise<{ requestId: string }> }) {
  try {
    const { requestId } = await context.params
    const result = await approveClubRequest(requestId)
    if (!result) return notFound('Club request not found.')

    return ok(result)
  } catch (error) {
    return serverError('Failed to approve club request.', String(error))
  }
}
