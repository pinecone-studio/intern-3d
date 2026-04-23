import { applyRateLimitHeaders, checkRateLimit, createRateLimitResponse } from '@/lib/api-rate-limit'
import { listScheduleEvents } from '@/lib/timeline-rest'

export const dynamic = 'force-dynamic'

const encoder = new TextEncoder()
const HEARTBEAT_INTERVAL_MS = 15_000
const DEFAULT_REFRESH_INTERVAL_MS = 30_000
const MIN_REFRESH_INTERVAL_MS = 5_000
const MAX_REFRESH_INTERVAL_MS = 60_000

function encodeSseChunk(event: string, data: unknown) {
  return encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
}

function encodeSseComment(comment: string) {
  return encoder.encode(`: ${comment}\n\n`)
}

function getRefreshIntervalMs(request: Request) {
  const { searchParams } = new URL(request.url)
  const requestedMs = Number(searchParams.get('intervalMs') ?? DEFAULT_REFRESH_INTERVAL_MS)
  if (!Number.isFinite(requestedMs)) return DEFAULT_REFRESH_INTERVAL_MS
  return Math.min(MAX_REFRESH_INTERVAL_MS, Math.max(MIN_REFRESH_INTERVAL_MS, requestedMs))
}

function getEventFilters(request: Request) {
  const { searchParams } = new URL(request.url)
  return {
    roomId: searchParams.get('roomId'),
    dayOfWeek: searchParams.get('dayOfWeek'),
    instructor: searchParams.get('instructor'),
  }
}

async function loadEventSnapshot(filters: ReturnType<typeof getEventFilters>) {
  const events = await listScheduleEvents(filters)
  return {
    generatedAt: new Date().toISOString(),
    filters: {
      roomId: filters.roomId ?? null,
      dayOfWeek: filters.dayOfWeek ?? null,
      instructor: filters.instructor ?? null,
    },
    count: events.length,
    events,
  }
}

export async function GET(request: Request) {
  const rateLimit = { key: 'events-stream', limit: 20, windowMs: 60_000 }
  const limitResult = checkRateLimit(request, rateLimit)
  if (!limitResult.allowed) return createRateLimitResponse(rateLimit, limitResult.resetAt)

  const filters = getEventFilters(request)
  const refreshIntervalMs = getRefreshIntervalMs(request)

  let initialSnapshot: Awaited<ReturnType<typeof loadEventSnapshot>>

  try {
    initialSnapshot = await loadEventSnapshot(filters)
  } catch (error) {
    return applyRateLimitHeaders(
      Response.json(
        {
          error: 'Unable to start event stream',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      ),
      rateLimit,
      limitResult.remaining,
      limitResult.resetAt
    )
  }

  let closed = false, heartbeatTimer: ReturnType<typeof setInterval> | undefined, refreshTimer: ReturnType<typeof setInterval> | undefined
  let lastSerializedSnapshot = JSON.stringify(initialSnapshot.events)

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const closeStream = () => {
        if (closed) return
        closed = true
        if (heartbeatTimer) clearInterval(heartbeatTimer)
        if (refreshTimer) clearInterval(refreshTimer)
        controller.close()
      }

      const safeEnqueue = (chunk: Uint8Array) => {
        if (closed) return
        try {
          controller.enqueue(chunk)
        } catch {
          closeStream()
        }
      }

      const publishSnapshot = async () => {
        try {
          const snapshot = await loadEventSnapshot(filters)
          const serializedSnapshot = JSON.stringify(snapshot.events)

          if (serializedSnapshot === lastSerializedSnapshot) return

          lastSerializedSnapshot = serializedSnapshot
          safeEnqueue(encodeSseChunk('events', snapshot))
        } catch (error) {
          safeEnqueue(
            encodeSseChunk('error', {
              message: error instanceof Error ? error.message : 'Unknown error',
              generatedAt: new Date().toISOString(),
            })
          )
        }
      }

      safeEnqueue(encodeSseComment('cloudflare-sse-connected'))
      safeEnqueue(
        encodeSseChunk('connected', {
          generatedAt: new Date().toISOString(),
          refreshIntervalMs,
        })
      )
      safeEnqueue(encodeSseChunk('events', initialSnapshot))

      heartbeatTimer = setInterval(() => safeEnqueue(encodeSseComment('heartbeat')), HEARTBEAT_INTERVAL_MS)
      refreshTimer = setInterval(() => void publishSnapshot(), refreshIntervalMs)

      request.signal.addEventListener('abort', closeStream, { once: true })
    },
    cancel() {
      closed = true
      if (heartbeatTimer) clearInterval(heartbeatTimer)
      if (refreshTimer) clearInterval(refreshTimer)
    },
  })

  const response = new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })

  return applyRateLimitHeaders(response, rateLimit, limitResult.remaining, limitResult.resetAt)
}
