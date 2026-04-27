'use client'

import { useEffect, useRef } from 'react'

type TimelineLiveUpdateOptions = {
  enabled?: boolean
  roomId?: string
  dayOfWeek?: number
  instructor?: string
  intervalMs?: number
  onEventsChanged: () => void | Promise<unknown>
}

const DEFAULT_INTERVAL_MS = 5_000

export function useTimelineLiveUpdates({
  enabled = true,
  roomId,
  dayOfWeek,
  instructor,
  intervalMs = DEFAULT_INTERVAL_MS,
  onEventsChanged,
}: TimelineLiveUpdateOptions) {
  const onEventsChangedRef = useRef(onEventsChanged)

  useEffect(() => {
    onEventsChangedRef.current = onEventsChanged
  }, [onEventsChanged])

  useEffect(() => {
    if (!enabled) {
      return
    }

    const searchParams = new URLSearchParams({
      intervalMs: String(intervalMs),
    })

    if (roomId) {
      searchParams.set('roomId', roomId)
    }

    if (typeof dayOfWeek === 'number') {
      searchParams.set('dayOfWeek', String(dayOfWeek))
    }

    if (instructor) {
      searchParams.set('instructor', instructor)
    }

    const eventSource = new EventSource(`/api/events/stream?${searchParams.toString()}`)
    let hasReceivedInitialSnapshot = false

    const handleEvents = () => {
      if (!hasReceivedInitialSnapshot) {
        hasReceivedInitialSnapshot = true
        return
      }

      void onEventsChangedRef.current()
    }

    eventSource.addEventListener('events', handleEvents)

    return () => {
      eventSource.removeEventListener('events', handleEvents)
      eventSource.close()
    }
  }, [dayOfWeek, enabled, instructor, intervalMs, roomId])
}
