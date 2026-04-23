import { getXpConfig, setXpConfig } from '@/lib/tom-db'
import { badRequest, ok, serverError } from '@/lib/tom-http'

export const runtime = 'edge'

export async function GET() {
  try {
    const config = await getXpConfig()
    return ok({ config })
  } catch (error) {
    return serverError('XP тохиргоо ачаалж чадсангүй.', error instanceof Error ? error.message : error)
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>
    const key = typeof body.key === 'string' ? body.key.trim() : ''
    const value = typeof body.value === 'string' ? body.value.trim() : ''

    if (!key) return badRequest('key заавал оруулна уу.')
    if (!value) return badRequest('value заавал оруулна уу.')

    await setXpConfig(key, value)
    return ok({ ok: true })
  } catch (error) {
    return serverError('XP тохиргоо хадгалж чадсангүй.', error instanceof Error ? error.message : error)
  }
}
