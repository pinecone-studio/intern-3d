import type { NextRequest } from 'next/server'

import { requireRole } from '@/lib/tom-api-auth'
import { seedTomDatabase } from '@/lib/tom-db'
import { forbidden, ok, serverError } from '@/lib/tom-http'


export async function POST(request: NextRequest) {
  try {
    const auth = await requireRole(request, 'admin', { activeOnly: true })
    if (auth.response) return auth.response

    if (process.env.ALLOW_SEED !== 'true') {
      return forbidden('Database seeding is disabled for this environment.')
    }

    const body = (await request.json().catch(() => ({}))) as { reset?: boolean }
    const result = await seedTomDatabase({ reset: body.reset === true })
    return ok(result)
  } catch (error) {
    return serverError('Failed to seed TOM database.', String(error))
  }
}
