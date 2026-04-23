import { deleteEvent, getEvent, upsertEvent } from '@/lib/tom-db'
import { badRequest, notFound, ok, serverError } from '@/lib/tom-http'
import type { EventStatus } from '@/lib/tom-types'

export const runtime = 'edge'

type Params = { params: Promise<{ eventId: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    const { eventId } = await params
    const event = await getEvent(eventId)
    if (!event) return notFound('Event олдсонгүй.')
    return ok({ event })
  } catch (error) {
    return serverError('Event ачаалж чадсангүй.', error instanceof Error ? error.message : error)
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { eventId } = await params
    const current = await getEvent(eventId)
    if (!current) return notFound('Event олдсонгүй.')

    const body = (await request.json()) as Record<string, unknown>

    const validStatuses: EventStatus[] = ['upcoming', 'ongoing', 'completed', 'cancelled']
    const status =
      typeof body.status === 'string' && validStatuses.includes(body.status as EventStatus)
        ? (body.status as EventStatus)
        : current.status

    const event = await upsertEvent(
      {
        title: typeof body.title === 'string' ? body.title : current.title,
        eventDate: typeof body.eventDate === 'string' ? body.eventDate : current.eventDate,
        description: typeof body.description === 'string' ? body.description : current.description,
        location: typeof body.location === 'string' ? body.location : current.location,
        startTime: typeof body.startTime === 'string' ? body.startTime : current.startTime,
        endTime: typeof body.endTime === 'string' ? body.endTime : current.endTime,
        status,
        createdBy: current.createdBy,
      },
      eventId
    )

    return ok({ event })
  } catch (error) {
    return serverError('Event шинэчилж чадсангүй.', error instanceof Error ? error.message : error)
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { eventId } = await params
    const deleted = await deleteEvent(eventId)
    if (!deleted) return notFound('Event олдсонгүй.')
    return ok({ ok: true })
  } catch (error) {
    return serverError('Event устгаж чадсангүй.', error instanceof Error ? error.message : error)
  }
}
