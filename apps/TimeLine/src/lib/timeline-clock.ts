export type TimelineClock = {
  now: Date
  currentDay: number
  currentTime: string
  currentMinutes: number
  scheduleDay: number | null
}

function padTimePart(value: number): string {
  return String(value).padStart(2, '0')
}

export function createTimelineClock(now: Date): TimelineClock {
  const currentDay = now.getDay()
  const currentTime = `${padTimePart(now.getHours())}:${padTimePart(now.getMinutes())}`

  return {
    now,
    currentDay,
    currentTime,
    currentMinutes: now.getHours() * 60 + now.getMinutes(),
    scheduleDay: currentDay >= 1 && currentDay <= 5 ? currentDay : null,
  }
}

export function getDefaultSelectedDay(clock: TimelineClock | null): number {
  return clock?.scheduleDay ?? 1
}
