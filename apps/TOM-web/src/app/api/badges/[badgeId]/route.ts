import type { NextRequest } from 'next/server'

import { requireRole } from '@/lib/tom-api-auth'
import { deleteBadge, getBadge, upsertBadge } from '@/lib/tom-db'
import { notFound, ok, serverError } from '@/lib/tom-http'
import type { BadgeInput } from '@/lib/tom-types'


type Params = { params: Promise<{ badgeId: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    const { badgeId } = await params
    const badge = await getBadge(badgeId)
    if (!badge) return notFound('Badge олдсонгүй.')
    return ok({ badge })
  } catch (error) {
    return serverError('Badge ачаалж чадсангүй.', error instanceof Error ? error.message : error)
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const auth = await requireRole(request, 'admin', { activeOnly: true })
    if (auth.response) return auth.response

    const { badgeId } = await params
    const existing = await getBadge(badgeId)
    if (!existing) return notFound('Badge олдсонгүй.')

    const body = (await request.json()) as Record<string, unknown>
    const input: BadgeInput = {
      name: typeof body.name === 'string' ? body.name : existing.name,
      description: typeof body.description === 'string' ? body.description : existing.description,
      icon: typeof body.icon === 'string' ? body.icon : existing.icon,
      xpThreshold: typeof body.xpThreshold === 'number' ? body.xpThreshold : existing.xpThreshold,
      eventCountThreshold: typeof body.eventCountThreshold === 'number' ? body.eventCountThreshold : existing.eventCountThreshold,
      clubCountThreshold: typeof body.clubCountThreshold === 'number' ? body.clubCountThreshold : existing.clubCountThreshold,
    }

    const badge = await upsertBadge(input, badgeId)
    return ok({ badge })
  } catch (error) {
    return serverError('Badge шинэчилж чадсангүй.', error instanceof Error ? error.message : error)
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const auth = await requireRole(request, 'admin', { activeOnly: true })
    if (auth.response) return auth.response

    const { badgeId } = await params
    const deleted = await deleteBadge(badgeId)
    if (!deleted) return notFound('Badge олдсонгүй.')
    return ok({ ok: true })
  } catch (error) {
    return serverError('Badge устгаж чадсангүй.', error instanceof Error ? error.message : error)
  }
}
