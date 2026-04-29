import {
  createMeta,
  DEFAULT_ACCOUNT_ID,
  DEFAULT_DATABASE_ID,
  type D1HttpQueryResponse,
} from '@/lib/d1-remote-types'

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
    const row = (await this.all<Record<string, unknown>>()).results[0]
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
    const rows = (await this.all<Record<string, unknown>>()).results
    const columnNames = Object.keys(rows[0] ?? {})
    const rawRows = rows.map((row) => columnNames.map((column) => row[column]) as T)
    return options?.columnNames ? [columnNames, ...rawRows] : rawRows
  }
}

class RemoteD1Database {
  private readonly endpoint: string
  private readonly apiToken: string

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
    const errorMessage = firstResult?.error
      ?? payload.errors?.map((error) => error.message).filter(Boolean).join(', ')
      ?? response.statusText

    if (!response.ok || !payload.success || firstResult?.success === false) {
      throw new Error(`Remote D1 query failed: ${errorMessage}`)
    }

    return { success: true, results: firstResult?.results ?? [], meta: firstResult?.meta ?? createMeta() }
  }
}

export function getRemoteD1Database(): D1Database | null {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID ?? DEFAULT_ACCOUNT_ID
  const databaseId = process.env.ACADEMIC_TIMELINE_DB_ID ?? DEFAULT_DATABASE_ID

  if (process.env.NODE_ENV !== 'development' || !apiToken || !accountId || !databaseId) {
    return null
  }

  return new RemoteD1Database(accountId, databaseId, apiToken) as unknown as D1Database
}
