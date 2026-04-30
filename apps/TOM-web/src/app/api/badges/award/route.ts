import type { NextRequest } from 'next/server'

import { requireRole } from '@/lib/tom-api-auth'
import { checkAndAwardBadges, getUser } from '@/lib/tom-db'
import { badRequest, notFound, ok, serverError } from '@/lib/tom-http'


export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, 'admin', { activeOnly: true })
    if (auth.response) return auth.response

    const body = (await request.json()) as Record<string, unknown>
    const userId = typeof body.userId === 'string' ? body.userId.trim() : ''
    if (!userId) return badRequest('userId заавал оруулна уу.')

    const user = await getUser(userId)
    if (!user) return notFound('Хэрэглэгч олдсонгүй.')

    const awarded = await checkAndAwardBadges(userId)
    return ok({ awarded, count: awarded.length })
  } catch (error) {
    return serverError('Badge шалгаж чадсангүй.', error instanceof Error ? error.message : error)
  }
}
