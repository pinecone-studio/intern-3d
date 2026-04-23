import { getEvent, joinEvent, leaveEvent } from '@/lib/tom-db'
import { badRequest, notFound, ok, serverError } from '@/lib/tom-http'

export const runtime = 'edge'

type Params = { params: Promise<{ eventId: string }> }

export async function POST(request: Request, { params }: Params) {
  try {
    const { eventId } = await params
    const event = await getEvent(eventId)
    if (!event) return notFound('Event олдсонгүй.')

    const body = (await request.json()) as Record<string, unknown>
    const userId = typeof body.userId === 'string' ? body.userId.trim() : ''
    if (!userId) return badRequest('userId заавал оруулна уу.')

    await joinEvent(eventId, userId)
    return ok({ ok: true })
  } catch (error) {
    return serverError('Event-д нэгдэж чадсангүй.', error instanceof Error ? error.message : error)
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { eventId } = await params
    const event = await getEvent(eventId)
    if (!event) return notFound('Event олдсонгүй.')

    const body = (await request.json()) as Record<string, unknown>
    const userId = typeof body.userId === 'string' ? body.userId.trim() : ''
    if (!userId) return badRequest('userId заавал оруулна уу.')

    await leaveEvent(eventId, userId)
    return ok({ ok: true })
  } catch (error) {
    return serverError('Event-ээс гарч чадсангүй.', error instanceof Error ? error.message : error)
  }
}
