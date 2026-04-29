import type { NextRequest } from 'next/server'

import { requireAdmin } from '@/lib/tom-api-auth'
import { badRequest, ok, serverError } from '@/lib/tom-http'
import { listClubRequests, upsertClubRequest } from '@/lib/tom-db'
import { parseClubRequestInput } from '@/lib/tom-validators'


export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (auth.response) return auth.response

    const { searchParams } = new URL(request.url)
    const requests = await listClubRequests({
      requestStatus: searchParams.get('requestStatus'),
      clubStatus: searchParams.get('clubStatus'),
      teacher: searchParams.get('teacher'),
      q: searchParams.get('q'),
    })

    return ok({ requests })
  } catch (error) {
    return serverError('Failed to load club requests.', String(error))
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const input = parseClubRequestInput(body)
    if (!input) return badRequest('Club request name is required.')

    const clubRequest = await upsertClubRequest({
      ...input,
      createdBy: input.createdBy ?? 'Сурагч',
      requestStatus: 'pending',
      clubStatus: 'pending',
      flaggedReason: null,
    })
    return ok({ request: clubRequest }, { status: 201 })
  } catch (error) {
    return serverError('Failed to create club request.', String(error))
  }
}
