import { drizzle } from 'drizzle-orm/d1'
import { getTimelineDb } from '@/lib/d1'

export function getDrizzleDb() {
  return drizzle(getTimelineDb())
}
