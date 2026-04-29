/* eslint-disable camelcase */

export type TimelineCloudflareEnv = CloudflareEnv & {
  ACADEMIC_TIMELINE_DB?: D1Database
}

export const DEFAULT_ACCOUNT_ID = '7d8b0122a2359d0987e1bd36da7f7882'
export const DEFAULT_DATABASE_ID = 'dd763e75-72c1-40c0-82f2-9e94209df36f'

export type D1HttpQueryResponse<T> = {
  success: boolean
  errors?: { message?: string }[]
  result?: Array<{
    success: boolean
    results?: T[]
    meta?: D1Meta & Record<string, unknown>
    error?: string
  }>
}

export function createMeta(): D1Meta & Record<string, unknown> {
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
