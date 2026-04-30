import { checkAndAwardBadges, listBadges, upsertBadge } from '@/lib/tom-db'
import type { Badge, BadgeInput, UserBadge } from '@/lib/tom-types'

export async function getAllBadges(): Promise<Badge[]> {
  return listBadges()
}

export async function createBadge(input: BadgeInput): Promise<Badge> {
  return upsertBadge(input)
}

export async function assignBadgesAfterXpChange(userId: string): Promise<UserBadge[]> {
  return checkAndAwardBadges(userId)
}
