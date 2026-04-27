'use client'

import { useEffect, useState } from 'react'
import { createTimelineClock, type TimelineClock } from './timeline-clock'

export function useTimelineClock(): TimelineClock | null {
  const [clock, setClock] = useState<TimelineClock | null>(null)

  useEffect(() => {
    const updateClock = () => {
      setClock(createTimelineClock(new Date()))
    }

    updateClock()

    const intervalId = window.setInterval(updateClock, 60000)
    return () => window.clearInterval(intervalId)
  }, [])

  return clock
}
