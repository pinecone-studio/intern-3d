import { checkAndAwardBadges, getUser, getUserXpTotal, grantXp } from '@/lib/tom-db'
import type { UserBadge, XpLog, XpSource } from '@/lib/tom-types'

type GrantXpResult = {
  log: XpLog
  totalXp: number
  newBadges: UserBadge[]
}

export async function grantXpToUser(
  userId: string,
  amount: number,
  reason: string,
  source: XpSource = 'manual'
): Promise<GrantXpResult> {
  const user = await getUser(userId)
  if (!user) throw new Error('User not found')

  const log = await grantXp(userId, amount, reason, source)
  const totalXp = await getUserXpTotal(userId)
  const newBadges = await checkAndAwardBadges(userId)

  return { log, totalXp, newBadges }
}

export async function getTotalXP(userId: string): Promise<number> {
  return getUserXpTotal(userId)
}
