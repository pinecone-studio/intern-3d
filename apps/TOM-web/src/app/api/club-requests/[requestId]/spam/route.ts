import { notFound, ok, serverError } from '@/lib/tom-http'
import { markClubRequestAsSpam } from '@/lib/tom-db'

export const runtime = 'edge'

export async function POST(request: Request, context: { params: Promise<{ requestId: string }> }) {
  try {
    const { requestId } = await context.params
    const body = (await request.json().catch(() => ({}))) as { flaggedReason?: string }
    const clubRequest = await markClubRequestAsSpam(requestId, body.flaggedReason)
    if (!clubRequest) return notFound('Club request not found.')

    return ok({ request: clubRequest })
  } catch (error) {
    return serverError('Failed to mark club request as spam.', String(error))
  }
}
