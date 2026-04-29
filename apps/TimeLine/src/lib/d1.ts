import { getCloudflareContext } from '@opennextjs/cloudflare'
import { getRemoteD1Database } from '@/lib/d1-remote-client'
import type { TimelineCloudflareEnv } from '@/lib/d1-remote-types'

export function getTimelineDb() {
  const remoteDatabase = getRemoteD1Database()
  if (remoteDatabase) return remoteDatabase

  const { env } = getCloudflareContext() as { env: TimelineCloudflareEnv }

  if (!env.ACADEMIC_TIMELINE_DB) {
    throw new Error(
      'Cloudflare D1 binding ACADEMIC_TIMELINE_DB is not available. Update apps/TimeLine/wrangler.jsonc with your real database_id and run the app through the Cloudflare preview flow.'
    )
  }

  return env.ACADEMIC_TIMELINE_DB
}
