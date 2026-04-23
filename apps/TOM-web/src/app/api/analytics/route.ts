import { getAnalytics } from '@/lib/tom-db'
import { ok, serverError } from '@/lib/tom-http'

export const runtime = 'edge'

export async function GET() {
  try {
    const analytics = await getAnalytics()
    return ok({ analytics })
  } catch (error) {
    return serverError('Analytics ачаалж чадсангүй.', error instanceof Error ? error.message : error)
  }
}
