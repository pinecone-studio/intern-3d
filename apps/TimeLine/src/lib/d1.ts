import { getCloudflareContext } from '@opennextjs/cloudflare'

/* eslint-disable camelcase, max-lines */

type TimelineCloudflareEnv = CloudflareEnv & {
  ACADEMIC_TIMELINE_DB?: D1Database
}

const DEFAULT_ACCOUNT_ID = '7d8b0122a2359d0987e1bd36da7f7882'
const DEFAULT_DATABASE_ID = 'dd763e75-72c1-40c0-82f2-9e94209df36f'

type D1HttpQueryResponse<T> = {
  success: boolean
  errors?: { message?: string }[]
  result?: Array<{
    success: boolean
    results?: T[]
    meta?: D1Meta & Record<string, unknown>
    error?: string
  }>
}

function createMeta(): D1Meta & Record<string, unknown> {
  return {
    duration: 0,
    size_after: 0,
    rows_read: 0,
    rows_written: 0,
    last_row_id: 0,
    changed_db: false,
    changes: 0,
  }
}

class RemoteD1PreparedStatement {
  private readonly database: RemoteD1Database
  private readonly query: string
  private readonly params: unknown[]

  constructor(
    database: RemoteD1Database,
    query: string,
    params: unknown[] = []
  ) {
    this.database = database
    this.query = query
    this.params = params
  }

  bind(...values: unknown[]): D1PreparedStatement {
    return new RemoteD1PreparedStatement(this.database, this.query, values) as unknown as D1PreparedStatement
  }

  async first<T = Record<string, unknown>>(colName?: string): Promise<T | null> {
    const result = await this.all<Record<string, unknown>>()
    const row = result.results[0]
    if (!row) return null
    return (colName ? row[colName] : row) as T
  }

  async run<T = Record<string, unknown>>(): Promise<D1Result<T>> {
    return this.database.query<T>(this.query, this.params)
  }

  async all<T = Record<string, unknown>>(): Promise<D1Result<T>> {
    return this.database.query<T>(this.query, this.params)
  }

  async raw<T = unknown[]>(options?: { columnNames?: boolean }): Promise<T[] | [string[], ...T[]]> {
    const result = await this.all<Record<string, unknown>>()
    const rows = result.results
    const columnNames = Object.keys(rows[0] ?? {})
    const rawRows = rows.map((row) => columnNames.map((column) => row[column]) as T)

    if (options?.columnNames) {
      return [columnNames, ...rawRows]
    }

    return rawRows
  }
}

class RemoteD1Database {
  private readonly apiToken: string
  private readonly endpoint: string

  constructor(
    accountId: string,
    databaseId: string,
    apiToken: string
  ) {
    this.apiToken = apiToken
    this.endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`
  }

  prepare(query: string): D1PreparedStatement {
    return new RemoteD1PreparedStatement(this, query) as unknown as D1PreparedStatement
  }

  async batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]> {
    return Promise.all(statements.map((statement) => statement.all<T>()))
  }

  async exec(query: string): Promise<D1ExecResult> {
    await this.query(query, [])
    return { count: 1, duration: 0 }
  }

  async query<T>(sql: string, params: unknown[]): Promise<D1Result<T>> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql, params }),
    })

    const payload = (await response.json()) as D1HttpQueryResponse<T>
    const firstResult = payload.result?.[0]
    const errorMessage =
      firstResult?.error ??
      payload.errors?.map((error) => error.message).filter(Boolean).join(', ') ??
      response.statusText

    if (!response.ok || !payload.success || firstResult?.success === false) {
      throw new Error(`Remote D1 query failed: ${errorMessage}`)
    }

    return {
      success: true,
      results: firstResult?.results ?? [],
      meta: firstResult?.meta ?? createMeta(),
    }
  }
}

function getRemoteD1Database(): D1Database | null {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID ?? DEFAULT_ACCOUNT_ID
  const databaseId = process.env.ACADEMIC_TIMELINE_DB_ID ?? DEFAULT_DATABASE_ID

  if (process.env.NODE_ENV !== 'development' || !apiToken || !accountId || !databaseId) {
    return null
  }

  return new RemoteD1Database(accountId, databaseId, apiToken) as unknown as D1Database
}

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
