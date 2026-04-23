import { getUser, getUserXpTotal, listXpLogs } from '@/lib/tom-db'
import { notFound, ok, serverError } from '@/lib/tom-http'

export const runtime = 'edge'

type Params = { params: Promise<{ userId: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    const { userId } = await params
    const user = await getUser(userId)
    if (!user) return notFound('Хэрэглэгч олдсонгүй.')

    const [total, logs] = await Promise.all([
      getUserXpTotal(userId),
      listXpLogs(userId),
    ])

    return ok({ userId, total, logs })
  } catch (error) {
    return serverError('XP мэдээлэл ачаалж чадсангүй.', error instanceof Error ? error.message : error)
  }
}
