import { getCloudflareContext } from '@opennextjs/cloudflare'

type TomCloudflareEnv = CloudflareEnv & {
  TOM_DB?: D1Database
}

export function getTomDb() {
  const { env } = getCloudflareContext() as { env: TomCloudflareEnv }

  if (!env.TOM_DB) {
    throw new Error(
      'Cloudflare D1 binding TOM_DB is not available. Run the app through the Cloudflare preview flow after setting up wrangler.jsonc.'
    )
  }

  return env.TOM_DB
}
