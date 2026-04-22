/// <reference types="@cloudflare/workers-types" />

interface CloudflareEnv {
  ASSETS: Fetcher
  TOM_DB: D1Database
}
