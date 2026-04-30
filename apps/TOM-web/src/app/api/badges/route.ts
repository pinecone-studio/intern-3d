import type { NextRequest } from 'next/server'

import { requireRole } from '@/lib/tom-api-auth'
import { listBadges, upsertBadge } from '@/lib/tom-db'
import { badRequest, ok, serverError } from '@/lib/tom-http'
import type { BadgeInput } from '@/lib/tom-types'


export async function GET() {
  try {
    const badges = await listBadges()
    return ok({ badges })
  } catch (error) {
    return serverError('Badge жагсаалт ачаалж чадсангүй.', error instanceof Error ? error.message : error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, 'admin', { activeOnly: true })
    if (auth.response) return auth.response

    const body = (await request.json()) as Record<string, unknown>
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name) return badRequest('name заавал оруулна уу.')

    const input: BadgeInput = {
      name,
      description: typeof body.description === 'string' ? body.description : '',
      icon: typeof body.icon === 'string' ? body.icon : '',
      xpThreshold: typeof body.xpThreshold === 'number' ? body.xpThreshold : 0,
      eventCountThreshold: typeof body.eventCountThreshold === 'number' ? body.eventCountThreshold : 0,
      clubCountThreshold: typeof body.clubCountThreshold === 'number' ? body.clubCountThreshold : 0,
    }

    const badge = await upsertBadge(input)
    return ok({ badge }, { status: 201 })
  } catch (error) {
    return serverError('Badge үүсгэж чадсангүй.', error instanceof Error ? error.message : error)
  }
}
