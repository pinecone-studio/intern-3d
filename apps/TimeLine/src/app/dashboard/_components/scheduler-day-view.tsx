'use client'

import Link from 'next/link'
import { DAY_VIEW_SLOT_COUNT, DAY_VIEW_SLOT_INDEXES, DAY_VIEW_SLOT_MINUTES } from '@/app/dashboard/_lib/scheduler-constants'
import { eventOccursInWeekOnDay, getEventLabel, getEventTone } from '@/app/dashboard/_lib/scheduler-event-utils'
import { clampEventToPlanningDay, slotToTime, timeToMinutes } from '@/app/dashboard/_lib/scheduler-time-utils'
import type { Selection } from '@/app/dashboard/_lib/scheduler-types'
import type { Room, ScheduleEvent } from '@/lib/types'
import { cn } from '@/lib/utils'

type SchedulerDayViewProps = {
  errorMessage?: string
  events: ScheduleEvent[]
  focusedDateIso: string
  focusedDateLabel: string
  focusedDateTitle: string
  focusedDayOfWeek: number
  loading: boolean
  onContextMenu: (_event: React.MouseEvent, _roomId: string, _dayOfWeek: number, _slot: number, _slotMinutes: number) => void
  onEditEvent: (_event: ScheduleEvent, _roomId: string, _dayOfWeek: number) => void
  onEventDrop: (_event: ScheduleEvent, _roomId: string, _dayOfWeek: number, _slot: number, _slotMinutes: number, _targetDateIso: string, _sourceDateIso: string, _sourceDayOfWeek: number) => void
  onPointerDown: (_roomId: string, _dayOfWeek: number, _slot: number, _slotMinutes: number, _button: number, _append: boolean) => void
  onPointerEnter: (_roomId: string, _dayOfWeek: number, _slot: number) => void
  onPointerUp: (_roomId: string, _dayOfWeek: number, _slot: number, _slotMinutes: number) => void
  rooms: Room[]
  selections: Selection[]
}

function safeParseDragPayload(rawPayload: string) {
  try {
    return JSON.parse(rawPayload) as { eventId: string; sourceDateIso: string; sourceDayOfWeek: number }
  } catch {
    return null
  }
}

export function SchedulerDayView({
  errorMessage,
  events,
  focusedDateIso,
  focusedDateLabel,
  focusedDateTitle,
  focusedDayOfWeek,
  loading,
  onContextMenu,
  onEditEvent,
  onEventDrop,
  onPointerDown,
  onPointerEnter,
  onPointerUp,
  rooms,
  selections,
}: SchedulerDayViewProps) {
  const findDraggedEvent = (dragEvent: React.DragEvent) => {
    const rawPayload = dragEvent.dataTransfer.getData('application/json')
    const payload = rawPayload ? safeParseDragPayload(rawPayload) : null
    const eventId = payload?.eventId ?? dragEvent.dataTransfer.getData('text/plain')
    const event = events.find((candidate) => candidate.id === eventId) ?? null
    if (!event || !payload) return null
    return { event, sourceDateIso: payload.sourceDateIso, sourceDayOfWeek: payload.sourceDayOfWeek }
  }

  return (
    <div className="min-w-[980px]">
      <div className="sticky top-0 z-[2] grid grid-cols-[104px_minmax(860px,1fr)] border-b border-[#e1dfdd] bg-white dark:border-border dark:bg-card">
        <div className="border-r border-[#e1dfdd] px-2.5 py-2 text-[11px] font-semibold uppercase text-muted-foreground dark:border-border">Анги</div>
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold leading-5 text-foreground">{focusedDateTitle}</p>
              <p className="text-[11px] text-muted-foreground">30 минутын нарийвчлалтай day timeline</p>
            </div>
          </div>
          <div className="mt-2 grid text-[10px] text-muted-foreground" style={{ gridTemplateColumns: `repeat(${DAY_VIEW_SLOT_COUNT}, minmax(0, 1fr))` }}>
            {DAY_VIEW_SLOT_INDEXES.map((slot) => <span key={slot}>{slotToTime(slot, DAY_VIEW_SLOT_MINUTES)}</span>)}
          </div>
        </div>
      </div>

      {loading && rooms.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Ачаалж байна...</div>
      ) : errorMessage ? (
        <div className="m-4 rounded-md border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">{errorMessage}</div>
      ) : rooms.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Анги олдсонгүй</div>
      ) : (
        rooms.map((room) => {
          const dayEvents = events
            .filter((event) => event.roomId === room.id && eventOccursInWeekOnDay(event, focusedDayOfWeek, focusedDateIso))
            .sort((left, right) => timeToMinutes(left.startTime) - timeToMinutes(right.startTime))
          const daySelections = selections.filter((selection) => selection.roomId === room.id && selection.dayOfWeek === focusedDayOfWeek)

          return (
            <div key={room.id} className="grid min-h-[84px] grid-cols-[104px_minmax(860px,1fr)] border-b border-[#edebe9] dark:border-border">
              <Link href={`/dashboard/room/${room.id}`} className="flex flex-col justify-center border-r border-[#e1dfdd] bg-[#faf9f8] px-2.5 py-2 transition-colors hover:bg-[#f3f2f1] dark:border-border dark:bg-muted/30">
                <span className="text-[15px] font-semibold leading-5 text-foreground">{room.number}</span>
                <span className="text-[11px] text-muted-foreground">{room.type === 'lab' ? 'Lab' : 'Event hall'}</span>
              </Link>
              <div className="relative">
                <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${DAY_VIEW_SLOT_COUNT}, minmax(0, 1fr))` }}>
                  {DAY_VIEW_SLOT_INDEXES.map((slot) => <div key={slot} className="border-r border-[#f0f1f8] last:border-r-0 dark:border-border/60" />)}
                </div>
                <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${DAY_VIEW_SLOT_COUNT}, minmax(0, 1fr))` }}>
                  {DAY_VIEW_SLOT_INDEXES.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      className="relative z-[1] h-full cursor-crosshair border-r border-transparent outline-none transition-colors hover:bg-[#6264a7]/5"
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(dropEvent) => {
                        dropEvent.preventDefault()
                        const draggedEvent = findDraggedEvent(dropEvent)
                        if (draggedEvent) onEventDrop(draggedEvent.event, room.id, focusedDayOfWeek, slot, DAY_VIEW_SLOT_MINUTES, focusedDateIso, draggedEvent.sourceDateIso, draggedEvent.sourceDayOfWeek)
                      }}
                      onPointerDown={(event) => onPointerDown(room.id, focusedDayOfWeek, slot, DAY_VIEW_SLOT_MINUTES, event.button, event.metaKey || event.ctrlKey)}
                      onPointerEnter={() => onPointerEnter(room.id, focusedDayOfWeek, slot)}
                      onPointerUp={() => onPointerUp(room.id, focusedDayOfWeek, slot, DAY_VIEW_SLOT_MINUTES)}
                      onContextMenu={(event) => onContextMenu(event, room.id, focusedDayOfWeek, slot, DAY_VIEW_SLOT_MINUTES)}
                      aria-label={`${room.number} ${focusedDateLabel} ${slotToTime(slot, DAY_VIEW_SLOT_MINUTES)}`}
                    />
                  ))}
                </div>
                {daySelections.map((selection) => {
                  const selectedStart = Math.min(selection.startSlot, selection.endSlot)
                  const selectedEnd = Math.max(selection.startSlot, selection.endSlot) + 1
                  return <div key={`${selection.roomId}-${selection.dayOfWeek}-${selectedStart}-${selectedEnd}`} className="pointer-events-none absolute bottom-2 top-2 z-[2] rounded-lg border border-[#6264a7] bg-[#6264a7]/15 shadow-[inset_0_0_0_1px_rgba(98,100,167,0.25)]" style={{ left: `${(selectedStart / DAY_VIEW_SLOT_COUNT) * 100}%`, width: `${((selectedEnd - selectedStart) / DAY_VIEW_SLOT_COUNT) * 100}%` }} />
                })}
                {dayEvents.map((event) => {
                  const position = clampEventToPlanningDay(event, DAY_VIEW_SLOT_MINUTES)
                  if (!position) return null
                  return (
                    <button
                      key={`${event.id}-${focusedDateIso}-${room.id}`}
                      type="button"
                      draggable
                      className={cn('absolute bottom-2 top-2 z-[3] cursor-move overflow-hidden rounded-lg border border-[#d1d1d1] border-l-4 px-2.5 py-1.5 text-left text-xs shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md', getEventTone(event.type))}
                      style={{ left: `${position.left}%`, width: `${position.width}%` }}
                      onClick={() => onEditEvent(event, room.id, focusedDayOfWeek)}
                      onDragStart={(dragEvent) => {
                        dragEvent.dataTransfer.setData('text/plain', event.id)
                        dragEvent.dataTransfer.setData('application/json', JSON.stringify({ eventId: event.id, sourceDateIso: focusedDateIso, sourceDayOfWeek: focusedDayOfWeek }))
                        dragEvent.dataTransfer.effectAllowed = 'move'
                      }}
                    >
                      <span className="block truncate text-[12px] font-semibold">{event.title}</span>
                      <span className="block truncate opacity-80">{event.startTime}-{event.endTime} · {getEventLabel(event.type)}</span>
                      {event.notes && <span className="mt-1 block truncate opacity-70">{event.notes}</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
