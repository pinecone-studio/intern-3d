'use client'

import Link from 'next/link'
import { HOUR_GRID_TEMPLATE, HOUR_MARKS, PLANNING_START_HOUR, SCHEDULER_GRID_TEMPLATE, SLOT_COUNT, SLOT_INDEXES, SLOT_GRID_TEMPLATE, SLOT_MINUTES, VISIBLE_HOUR_MARKS, WORK_DAYS } from '@/app/dashboard/_lib/scheduler-constants'
import { eventOccursInWeekOnDay, getEventLabel, getEventTone } from '@/app/dashboard/_lib/scheduler-event-utils'
import { clampEventToPlanningDay, slotToTime, timeToMinutes } from '@/app/dashboard/_lib/scheduler-time-utils'
import type { Selection } from '@/app/dashboard/_lib/scheduler-types'
import { RoomWeeklySchedule } from '@/app/dashboard/_components/room-weekly-schedule'
import { Badge } from '@/components/ui/badge'
import type { Room, ScheduleEvent } from '@/lib/types'
import { cn } from '@/lib/utils'

type SchedulerWeekViewProps = {
  errorMessage?: string
  events: ScheduleEvent[]
  loading: boolean
  onContextMenu: (_event: React.MouseEvent, _roomId: string, _dayOfWeek: number, _slot: number, _slotMinutes: number) => void
  onEditEvent: (_event: ScheduleEvent, _roomId: string, _dayOfWeek: number) => void
  onEventDrop: (_event: ScheduleEvent, _roomId: string, _dayOfWeek: number, _slot: number, _slotMinutes: number, _targetDateIso: string, _sourceDateIso: string, _sourceDayOfWeek: number) => void
  onPointerDown: (_roomId: string, _dayOfWeek: number, _slot: number, _slotMinutes: number, _button: number, _append: boolean) => void
  onPointerEnter: (_roomId: string, _dayOfWeek: number, _slot: number) => void
  onPointerUp: (_roomId: string, _dayOfWeek: number, _slot: number, _slotMinutes: number) => void
  rooms: Room[]
  selectedRoomTab: string
  selectedRoomView: Room | null
  selections: Selection[]
  weekDates: string[]
}

function safeParseDragPayload(rawPayload: string) {
  try {
    return JSON.parse(rawPayload) as { eventId: string; sourceDateIso: string; sourceDayOfWeek: number }
  } catch {
    return null
  }
}

export function SchedulerWeekView({ errorMessage, events, loading, onContextMenu, onEditEvent, onEventDrop, onPointerDown, onPointerEnter, onPointerUp, rooms, selectedRoomTab, selectedRoomView, selections, weekDates }: SchedulerWeekViewProps) {
  const findDraggedEvent = (dragEvent: React.DragEvent) => {
    const rawPayload = dragEvent.dataTransfer.getData('application/json')
    const payload = rawPayload ? safeParseDragPayload(rawPayload) : null
    const eventId = payload?.eventId ?? dragEvent.dataTransfer.getData('text/plain')
    const event = events.find((candidate) => candidate.id === eventId) ?? null
    if (!event || !payload) return null
    return { event, sourceDateIso: payload.sourceDateIso, sourceDayOfWeek: payload.sourceDayOfWeek }
  }

  if (selectedRoomTab !== 'all') {
    return (
      <div className="p-4">
        <RoomWeeklySchedule
          room={selectedRoomView}
          events={events}
          onEditEvent={(event, dayOfWeek) => selectedRoomView && onEditEvent(event, selectedRoomView.id, dayOfWeek)}
        />
      </div>
    )
  }

  return (
    <div className="min-w-max">
      <div className="sticky top-0 z-[2] grid border-b border-[#e1dfdd] bg-white dark:border-border dark:bg-card" style={{ gridTemplateColumns: SCHEDULER_GRID_TEMPLATE }}>
        <div className="border-r border-[#e1dfdd] px-3 py-2 text-xs font-semibold uppercase text-muted-foreground dark:border-border">Анги</div>
        {WORK_DAYS.map((day, index) => (
          <div key={day.value} className="border-r border-[#e1dfdd] px-3 py-2 last:border-r-0 dark:border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold leading-5 text-foreground">{day.label}</p>
                <p className="text-[11px] text-muted-foreground">{weekDates[index]}</p>
              </div>
              <Badge variant="outline" className="rounded-md text-[10px]">{day.short}</Badge>
            </div>
            <div className="relative mt-1.5 h-4 text-[10px] text-muted-foreground">
              {VISIBLE_HOUR_MARKS.map((hour) => (
                <span key={hour} className="absolute top-0 -translate-x-1/2 whitespace-nowrap" style={{ left: `${((hour - PLANNING_START_HOUR) / (HOUR_MARKS.length - 1)) * 100}%` }}>
                  {hour}:00
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {loading && rooms.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Ачаалж байна...</div>
      ) : errorMessage ? (
        <div className="m-4 rounded-md border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">{errorMessage}</div>
      ) : rooms.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Анги олдсонгүй</div>
      ) : (
        rooms.map((room) => (
          <div key={room.id} className="grid min-h-[64px] border-b border-[#edebe9] dark:border-border" style={{ gridTemplateColumns: SCHEDULER_GRID_TEMPLATE }}>
            <Link href={`/dashboard/room/${room.id}`} className="flex flex-col justify-center border-r border-[#e1dfdd] bg-[#faf9f8] px-2.5 py-2 transition-colors hover:bg-[#f3f2f1] dark:border-border dark:bg-muted/30">
              <span className="text-[15px] font-semibold leading-5 text-foreground">{room.number}</span>
              <span className="text-[11px] text-muted-foreground">{room.type === 'lab' ? 'Lab' : 'Event hall'}</span>
            </Link>
            {WORK_DAYS.map((day, dayIndex) => {
              const dayDate = weekDates[dayIndex]
              const dayEvents = events
                .filter((event) => event.roomId === room.id && eventOccursInWeekOnDay(event, day.value, dayDate))
                .sort((left, right) => timeToMinutes(left.startTime) - timeToMinutes(right.startTime))
              const daySelections = selections.filter((selection) => selection.roomId === room.id && selection.dayOfWeek === day.value)

              return (
                <div key={day.value} className="relative border-r border-[#edebe9] last:border-r-0 dark:border-border">
                  <div className="absolute inset-0 grid" style={{ gridTemplateColumns: HOUR_GRID_TEMPLATE }}>
                    {HOUR_MARKS.slice(0, -1).map((hour) => <div key={hour} className="border-r border-[#f3f2f1] last:border-r-0 dark:border-border/60" />)}
                  </div>
                  <div className="absolute inset-0 grid" style={{ gridTemplateColumns: SLOT_GRID_TEMPLATE }}>
                    {SLOT_INDEXES.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        className="relative z-[1] h-full cursor-crosshair border-r border-transparent outline-none transition-colors hover:bg-[#6264a7]/5"
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(dropEvent) => {
                          dropEvent.preventDefault()
                          const draggedEvent = findDraggedEvent(dropEvent)
                          if (draggedEvent) onEventDrop(draggedEvent.event, room.id, day.value, slot, SLOT_MINUTES, dayDate, draggedEvent.sourceDateIso, draggedEvent.sourceDayOfWeek)
                        }}
                        onPointerDown={(event) => onPointerDown(room.id, day.value, slot, SLOT_MINUTES, event.button, event.metaKey || event.ctrlKey)}
                        onPointerEnter={() => onPointerEnter(room.id, day.value, slot)}
                        onPointerUp={() => onPointerUp(room.id, day.value, slot, SLOT_MINUTES)}
                        onContextMenu={(event) => onContextMenu(event, room.id, day.value, slot, SLOT_MINUTES)}
                        aria-label={`${room.number} ${day.label} ${slotToTime(slot, SLOT_MINUTES)}`}
                      />
                    ))}
                  </div>
                  {daySelections.map((selection) => {
                    const selectedStart = Math.min(selection.startSlot, selection.endSlot)
                    const selectedEnd = Math.max(selection.startSlot, selection.endSlot) + 1
                    return <div key={`${selection.roomId}-${selection.dayOfWeek}-${selectedStart}-${selectedEnd}`} className="pointer-events-none absolute bottom-1.5 top-1.5 z-[2] rounded-md border border-[#6264a7] bg-[#6264a7]/15 shadow-[inset_0_0_0_1px_rgba(98,100,167,0.25)]" style={{ left: `${(selectedStart / SLOT_COUNT) * 100}%`, width: `${((selectedEnd - selectedStart) / SLOT_COUNT) * 100}%` }} />
                  })}
                  {dayEvents.map((event) => {
                    const position = clampEventToPlanningDay(event, SLOT_MINUTES)
                    if (!position) return null
                    return (
                      <button
                        key={`${event.id}-${day.value}-${dayDate}`}
                        type="button"
                        draggable
                        className={cn('absolute bottom-1.5 top-1.5 z-[3] cursor-move overflow-hidden rounded-md border border-[#d1d1d1] border-l-4 px-2 py-1 text-left text-xs shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md', getEventTone(event.type))}
                        style={{ left: `${position.left}%`, width: `${position.width}%` }}
                        onClick={() => onEditEvent(event, room.id, day.value)}
                        onDragStart={(dragEvent) => {
                          dragEvent.dataTransfer.setData('text/plain', event.id)
                          dragEvent.dataTransfer.setData('application/json', JSON.stringify({ eventId: event.id, sourceDateIso: dayDate, sourceDayOfWeek: day.value }))
                          dragEvent.dataTransfer.effectAllowed = 'move'
                        }}
                      >
                        <span className="block truncate font-semibold">{event.title}</span>
                        <span className="block truncate opacity-80">{event.startTime}-{event.endTime} · {getEventLabel(event.type)}</span>
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        ))
      )}
    </div>
  )
}
