import { getDashboardSummary } from '@/lib/tom-db'
import { ok, serverError } from '@/lib/tom-http'

export const runtime = 'edge'

export async function GET() {
  try {
    const summary = await getDashboardSummary()
    return ok({ summary })
  } catch (error) {
    return serverError('Failed to load dashboard summary.', String(error))
  }
}
