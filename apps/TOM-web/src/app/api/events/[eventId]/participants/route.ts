import { getEvent, getEventParticipants } from '@/lib/tom-db'
import { notFound, ok, serverError } from '@/lib/tom-http'

export const runtime = 'edge'

type Params = { params: Promise<{ eventId: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    const { eventId } = await params
    const event = await getEvent(eventId)
    if (!event) return notFound('Event олдсонгүй.')

    const participants = await getEventParticipants(eventId)
    return ok({ participants, total: participants.length })
  } catch (error) {
    return serverError('Оролцогчдыг ачаалж чадсангүй.', error instanceof Error ? error.message : error)
  }
}
