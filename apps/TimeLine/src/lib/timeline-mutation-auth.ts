import { eq } from 'drizzle-orm'
import { getDrizzleDb } from '@/db/client'
import { usersTable } from '@/db/schema'

export async function requireScheduleEditorId(actorUserId: string | null): Promise<string> {
  if (!actorUserId) {
    throw new Error('Нэвтэрсэн админ хэрэглэгч шаардлагатай байна.')
  }

  const db = getDrizzleDb()
  const [user] = await db
    .select({ id: usersTable.id, role: usersTable.role })
    .from(usersTable)
    .where(eq(usersTable.id, actorUserId))
    .limit(1)

  if (!user) {
    throw new Error('Сессийн хэрэглэгч DB дээр олдсонгүй.')
  }

  if (user.role !== 'admin') {
    throw new Error('Зөвхөн админ хэрэглэгч хуваарь өөрчилж чадна.')
  }

  return user.id
}
