'use client'

import { DAYS_OF_WEEK, EVENT_TYPE_CONFIG } from '@/lib/constants'
import type { ScheduleEvent } from '@/lib/types'
import { cn } from '@/lib/utils'
import { timeToMinutes } from '@/app/dashboard/room/[roomId]/_lib/room-detail-utils'

type RoomWeeklyScheduleGridProps = {
  currentDay: number
  currentTime: string
  events: ScheduleEvent[]
  isAdmin: boolean
  onEditEvent: (_event: ScheduleEvent) => void
}

const GRID_START_HOUR = 8
const GRID_END_HOUR = 20
const HOUR_HEIGHT = 48

export function RoomWeeklyScheduleGrid({
  currentDay,
  currentTime,
  events,
  isAdmin,
  onEditEvent,
}: RoomWeeklyScheduleGridProps) {
  const days = DAYS_OF_WEEK.filter((day) => day.value >= 1 && day.value <= 5)
  const hours = Array.from({ length: GRID_END_HOUR - GRID_START_HOUR }, (_, index) => GRID_START_HOUR + index)
  const expandedEvents = events.flatMap((event) => event.daysOfWeek.filter((day) => day >= 1 && day <= 5).map((displayDay) => ({ ...event, displayDay })))
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
                className={cn('absolute cursor-pointer overflow-hidden rounded-md p-1.5 text-xs text-white transition-opacity hover:opacity-90', EVENT_TYPE_CONFIG[event.type].bgColor)}
                style={{ top: `${((clippedStart - GRID_START_HOUR * 60) / 60) * HOUR_HEIGHT}px`, height: `${((clippedEnd - clippedStart) / 60) * HOUR_HEIGHT}px`, left: `calc(60px + ${eventDayIndex} * ((100% - 60px) / 5) + 2px)`, width: 'calc((100% - 60px) / 5 - 4px)' }}
                onClick={() => isAdmin && onEditEvent(event)}
              >
                <div className="truncate font-medium">{event.title}</div>
                <div className="truncate opacity-80">{event.startTime} - {event.endTime}</div>
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
