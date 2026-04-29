import { getDashboardSummary } from '@/lib/tom-db'
import { requireAdmin } from '@/lib/tom-api-auth'
import { ok, serverError } from '@/lib/tom-http'
import type { NextRequest } from 'next/server'


export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (auth.response) return auth.response

    const summary = await getDashboardSummary()
    return ok({ summary })
  } catch (error) {
    return serverError('Failed to load dashboard summary.', String(error))
  }
}
