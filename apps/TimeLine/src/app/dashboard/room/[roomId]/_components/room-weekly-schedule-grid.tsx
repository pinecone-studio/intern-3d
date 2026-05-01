'use client'

import { getEventLabel, getEventTone } from '@/app/dashboard/_lib/scheduler-event-utils'
import { DAYS_OF_WEEK } from '@/lib/constants'
import type { ScheduleEvent } from '@/lib/types'
import { cn } from '@/lib/utils'
import { timeToMinutes } from '@/app/dashboard/room/[roomId]/_lib/room-detail-utils'

type RoomWeeklyScheduleGridProps = {
  currentDate: Date
  currentDay: number
  currentTime: string
  events: ScheduleEvent[]
  isAdmin: boolean
  onEditEvent: (_event: ScheduleEvent) => void
}

const GRID_START_HOUR = 8
const GRID_END_HOUR = 20
const HOUR_HEIGHT = 48

function toLocalDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function toIsoDay(date: Date): number {
  const day = date.getDay()
  return day === 0 ? 7 : day
}

function getWeekStart(date: Date): Date {
  const weekStart = new Date(date)
  weekStart.setHours(0, 0, 0, 0)
  const day = toIsoDay(weekStart)
  weekStart.setDate(weekStart.getDate() - (day - 1))
  return weekStart
}

function getDateForWeekDay(weekStart: Date, day: number): Date {
  const date = new Date(weekStart)
  date.setDate(weekStart.getDate() + day - 1)
  return date
}

function isRecurringEventValidOnDate(event: ScheduleEvent, dateIso: string): boolean {
  if (event.validFrom && dateIso < event.validFrom) return false
  if (event.validUntil && dateIso > event.validUntil) return false
  return true
}

export function RoomWeeklyScheduleGrid({
  currentDate,
  currentDay,
  currentTime,
  events,
  isAdmin,
  onEditEvent,
}: RoomWeeklyScheduleGridProps) {
  const days = DAYS_OF_WEEK.filter((day) => day.value >= 1 && day.value <= 5)
  const hours = Array.from({ length: GRID_END_HOUR - GRID_START_HOUR }, (_, index) => GRID_START_HOUR + index)
  const weekStart = getWeekStart(currentDate)
  const expandedEvents = events.flatMap((event) => {
    if (event.isOverride) {
      if (!event.date) return []
      const eventDate = new Date(`${event.date}T00:00:00`)
      const displayDay = toIsoDay(eventDate)
      if (displayDay < 1 || displayDay > 5) return []
      const weekDateIso = toLocalDateString(getDateForWeekDay(weekStart, displayDay))
      return weekDateIso === event.date ? [{ ...event, displayDay }] : []
    }

    return event.daysOfWeek
      .filter((displayDay) => displayDay >= 1 && displayDay <= 5)
      .filter((displayDay) => isRecurringEventValidOnDate(event, toLocalDateString(getDateForWeekDay(weekStart, displayDay))))
      .map((displayDay) => ({ ...event, displayDay }))
  })
  const currentMinutes = timeToMinutes(currentTime)
  const dayIndex = days.findIndex((day) => day.value === currentDay)
  const indicatorOffset = ((currentMinutes - GRID_START_HOUR * 60) / 60) * HOUR_HEIGHT
  const showIndicator = dayIndex !== -1 && indicatorOffset >= 0 && indicatorOffset <= (GRID_END_HOUR - GRID_START_HOUR) * HOUR_HEIGHT

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        <div className="grid grid-cols-[60px_repeat(5,1fr)] border-b">
          <div className="p-2 text-xs text-muted-foreground" />
          {days.map((day) => <div key={day.value} className={cn('border-l p-2 text-center text-sm font-medium', day.value === currentDay && 'bg-primary/10 text-primary')}>{day.label}</div>)}
        </div>
        <div className="relative">
          {hours.map((hour) => <div key={hour} className="grid h-12 grid-cols-[60px_repeat(5,1fr)] border-b"><div className="p-1 pr-2 pt-0 text-right text-xs text-muted-foreground -translate-y-2">{`${String(hour).padStart(2, '0')}:00`}</div>{days.map((day) => <div key={day.value} className="relative border-l" />)}</div>)}
          {expandedEvents.map((event, index) => {
            const eventDayIndex = days.findIndex((day) => day.value === event.displayDay)
            const startMinutes = timeToMinutes(event.startTime)
            const endMinutes = timeToMinutes(event.endTime)
            const clippedStart = Math.max(startMinutes, GRID_START_HOUR * 60)
            const clippedEnd = Math.min(endMinutes, GRID_END_HOUR * 60)
            if (eventDayIndex === -1 || !Number.isFinite(startMinutes) || !Number.isFinite(endMinutes) || clippedEnd <= clippedStart) return null

            return (
              <div
                key={`${event.id}-${event.displayDay}-${index}`}
                className={cn('absolute flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-md border border-[#d1d1d1] border-l-4 px-2 py-1 text-center text-xs shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md', getEventTone(event.type))}
                style={{ top: `${((clippedStart - GRID_START_HOUR * 60) / 60) * HOUR_HEIGHT}px`, height: `${((clippedEnd - clippedStart) / 60) * HOUR_HEIGHT}px`, left: `calc(60px + ${eventDayIndex} * ((100% - 60px) / 5) + 2px)`, width: 'calc((100% - 60px) / 5 - 4px)' }}
                onClick={() => isAdmin && onEditEvent(event)}
              >
                <div className="w-full truncate font-semibold">{event.title}</div>
                <div className="w-full truncate opacity-80">{event.startTime}-{event.endTime} · {getEventLabel(event.type)}</div>
              </div>
            )
          })}
          {showIndicator && (
            <div className="pointer-events-none absolute left-[60px] right-0 z-10 h-0.5 bg-destructive" style={{ top: `${indicatorOffset}px` }}>
              <div className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full bg-destructive" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
