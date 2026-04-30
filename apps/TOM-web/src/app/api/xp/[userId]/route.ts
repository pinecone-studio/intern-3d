import type { NextRequest } from 'next/server'

import { requireAuth } from '@/lib/tom-api-auth'
import { getUser, getUserXpTotal, listXpLogs } from '@/lib/tom-db'
import { forbidden, notFound, ok, serverError } from '@/lib/tom-http'
import { getLevelProgress } from '@/lib/level-service'


type Params = { params: Promise<{ userId: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const auth = await requireAuth(request)
    if (auth.response) return auth.response

    const { userId } = await params
    if (auth.user.role !== 'admin' && auth.user.id !== userId) {
      return forbidden('You can only access your own XP history.')
    }

    const user = await getUser(userId)
    if (!user) return notFound('Хэрэглэгч олдсонгүй.')

    const [total, logs] = await Promise.all([
      getUserXpTotal(userId),
      listXpLogs(userId),
    ])

    return ok({ userId, total, logs, level: getLevelProgress(total) })
  } catch (error) {
    return serverError('XP мэдээлэл ачаалж чадсангүй.', error instanceof Error ? error.message : error)
  }
}
