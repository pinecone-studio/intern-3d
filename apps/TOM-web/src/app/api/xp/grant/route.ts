import { getUser, grantXp } from '@/lib/tom-db'
import { badRequest, notFound, ok, serverError } from '@/lib/tom-http'
import type { XpSource } from '@/lib/tom-types'

export const runtime = 'edge'

const validSources: XpSource[] = ['manual', 'event', 'club', 'badge']

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>

    const userId = typeof body.userId === 'string' ? body.userId.trim() : ''
    const amount = typeof body.amount === 'number' ? body.amount : 0
    const reason = typeof body.reason === 'string' ? body.reason.trim() : ''
    const source: XpSource =
      typeof body.source === 'string' && validSources.includes(body.source as XpSource)
        ? (body.source as XpSource)
        : 'manual'

    if (!userId) return badRequest('userId заавал оруулна уу.')
    if (amount <= 0) return badRequest('amount 0-ээс их байх ёстой.')

    const user = await getUser(userId)
    if (!user) return notFound('Хэрэглэгч олдсонгүй.')

    const log = await grantXp(userId, amount, reason || `${amount} XP олгов`, source)
    return ok({ log }, { status: 201 })
  } catch (error) {
    return serverError('XP олгож чадсангүй.', error instanceof Error ? error.message : error)
  }
}
