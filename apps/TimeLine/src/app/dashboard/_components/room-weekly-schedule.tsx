'use client'

import { WORK_DAYS } from '@/app/dashboard/_lib/scheduler-constants'
import { getEventTone } from '@/app/dashboard/_lib/scheduler-event-utils'
import { timeToMinutes } from '@/app/dashboard/_lib/scheduler-time-utils'
import type { Room, ScheduleEvent } from '@/lib/types'
import { cn } from '@/lib/utils'

export function RoomWeeklySchedule({ room, events, onEditEvent }: { room: Room | null; events: ScheduleEvent[]; onEditEvent: (_event: ScheduleEvent, _dayOfWeek: number) => void }) {
  if (!room) return <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Анги олдсонгүй</div>
  const hours = Array.from({ length: 12 }, (_, index) => 8 + index)
  const expandedEvents = events.filter((event) => event.roomId === room.id && !event.isOverride).flatMap((event) => event.daysOfWeek.filter((day) => day >= 1 && day <= 5).map((day) => ({ event, day })))

  return (
    <div className="rounded-md border border-[#d1d1d1] bg-white shadow-sm dark:border-border dark:bg-card">
      <div className="border-b border-[#e1dfdd] px-4 py-3 dark:border-border"><p className="text-sm font-semibold text-foreground">Долоо хоногийн хуваарь · {room.number}</p></div>
      <div className="overflow-x-auto"><div className="min-w-[700px]"><div className="grid grid-cols-[60px_repeat(5,1fr)] border-b border-[#e1dfdd] dark:border-border"><div className="p-2 text-xs text-muted-foreground" />{WORK_DAYS.slice(0, 5).map((day) => <div key={day.value} className="border-l border-[#e1dfdd] p-2 text-center text-sm font-medium dark:border-border">{day.label}</div>)}</div><div className="relative">{hours.map((hour) => <div key={hour} className="grid h-12 grid-cols-[60px_repeat(5,1fr)] border-b border-[#edebe9] dark:border-border"><div className="p-1 pr-2 pt-0 text-right text-xs text-muted-foreground -translate-y-2">{`${String(hour).padStart(2, '0')}:00`}</div>{WORK_DAYS.slice(0, 5).map((day) => <div key={day.value} className="border-l border-[#edebe9] dark:border-border" />)}</div>)}{expandedEvents.map(({ event, day }, index) => { const dayIndex = WORK_DAYS.findIndex((entry) => entry.value === day); const startMinutes = timeToMinutes(event.startTime); const endMinutes = timeToMinutes(event.endTime); const clippedStart = Math.max(startMinutes, 8 * 60); const clippedEnd = Math.min(endMinutes, 20 * 60); if (dayIndex === -1 || !Number.isFinite(startMinutes) || !Number.isFinite(endMinutes) || clippedEnd <= clippedStart) return null; return <button key={`${event.id}-${day}-${index}`} type="button" className={cn('absolute overflow-hidden rounded-md border border-[#d1d1d1] border-l-4 p-1.5 text-left text-xs shadow-sm transition-opacity hover:opacity-90', getEventTone(event.type))} style={{ top: `${((clippedStart - 8 * 60) / 60) * 48}px`, height: `${((clippedEnd - clippedStart) / 60) * 48}px`, left: `calc(60px + ${dayIndex} * ((100% - 60px) / 5) + 2px)`, width: 'calc((100% - 60px) / 5 - 4px)' }} onClick={() => onEditEvent(event, day)}><div className="truncate font-medium">{event.title}</div><div className="truncate opacity-80">{event.startTime} - {event.endTime}</div></button> })}</div></div></div>
    </div>
  )
}
