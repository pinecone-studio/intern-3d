import { getCloudflareContext } from '@opennextjs/cloudflare'

type TimelineCloudflareEnv = CloudflareEnv & {
  ACADEMIC_TIMELINE_DB?: D1Database
}

export function getTimelineDb() {
  const { env } = getCloudflareContext() as { env: TimelineCloudflareEnv }

  if (!env.ACADEMIC_TIMELINE_DB) {
    throw new Error(
      'Cloudflare D1 binding ACADEMIC_TIMELINE_DB is not available. Update apps/TimeLine/wrangler.jsonc with your real database_id and run the app through the Cloudflare preview flow.'
    )
  }

  return env.ACADEMIC_TIMELINE_DB
}
