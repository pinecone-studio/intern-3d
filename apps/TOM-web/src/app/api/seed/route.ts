import { seedTomDatabase } from '@/lib/tom-db'
import { ok, serverError } from '@/lib/tom-http'

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { reset?: boolean }
    const result = await seedTomDatabase({ reset: body.reset === true })
    return ok(result)
  } catch (error) {
    return serverError('Failed to seed TOM database.', String(error))
  }
}
