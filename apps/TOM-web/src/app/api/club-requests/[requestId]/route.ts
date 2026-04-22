import { badRequest, notFound, ok, serverError } from '@/lib/tom-http'
import { deleteClubRequest, getClubRequest, upsertClubRequest } from '@/lib/tom-db'
import { parseClubRequestInput } from '@/lib/tom-validators'

export async function GET(_request: Request, context: { params: Promise<{ requestId: string }> }) {
  try {
    const { requestId } = await context.params
    const clubRequest = await getClubRequest(requestId)
    if (!clubRequest) return notFound('Club request not found.')

    return ok({ request: clubRequest })
  } catch (error) {
    return serverError('Failed to load club request.', String(error))
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ requestId: string }> }) {
  try {
    const { requestId } = await context.params
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const current = await getClubRequest(requestId)
    if (!current) return notFound('Club request not found.')

    const merged = parseClubRequestInput({
      ...current,
      ...body,
      clubName: body.clubName ?? current.clubName,
    })
    if (!merged) return badRequest('Club request name is required.')

    const clubRequest = await upsertClubRequest(merged, requestId)
    return ok({ request: clubRequest })
  } catch (error) {
    return serverError('Failed to update club request.', String(error))
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ requestId: string }> }) {
  try {
    const { requestId } = await context.params
    const deleted = await deleteClubRequest(requestId)
    if (!deleted) return notFound('Club request not found.')

    return ok({ ok: true })
  } catch (error) {
    return serverError('Failed to delete club request.', String(error))
  }
}
