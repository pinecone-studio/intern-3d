import { getFormOptions } from '@/lib/tom-db'
import { ok, serverError } from '@/lib/tom-http'

export async function GET() {
  try {
    const options = await getFormOptions()
    return ok({ options })
  } catch (error) {
    return serverError('Failed to load form options.', String(error))
  }
}
