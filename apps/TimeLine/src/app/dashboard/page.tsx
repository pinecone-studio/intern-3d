'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import type { MouseEvent } from 'react'
import Link from 'next/link'
import { gql } from '@apollo/client'
import { useMutation, useQuery } from '@apollo/client/react'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MousePointer2,
  Plus,
  RefreshCcw,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RoomCard } from '@/components/rooms/room-card'
import { RoomFilterBar } from '@/components/rooms/room-filter-bar'
import { STATUS_CONFIG } from '@/lib/constants'
import { useTimelineLiveUpdates } from '@/lib/use-timeline-live-updates'
import { useRole } from '@/lib/role-context'
import { cn } from '@/lib/utils'
import type { EventType, Room, RoomStatus, ScheduleEvent } from '@/lib/types'

const PLANNING_START_HOUR = 13
const PLANNING_END_HOUR = 20
const SLOT_MINUTES = 60
const DAY_MINUTES = (PLANNING_END_HOUR - PLANNING_START_HOUR) * 60

const WORK_DAYS = [
  { value: 1, label: 'Даваа', short: 'Mon' },
  { value: 2, label: 'Мягмар', short: 'Tue' },
  { value: 3, label: 'Лхагва', short: 'Wed' },
  { value: 4, label: 'Пүрэв', short: 'Thu' },
  { value: 5, label: 'Баасан', short: 'Fri' },
] as const

const HOUR_MARKS = Array.from({ length: PLANNING_END_HOUR - PLANNING_START_HOUR + 1 }, (_, index) => PLANNING_START_HOUR + index)
const SLOT_COUNT = DAY_MINUTES / SLOT_MINUTES
const SLOT_INDEXES = Array.from({ length: SLOT_COUNT }, (_, index) => index)

const GET_SCHEDULER_DATA = gql`
  query GetSchedulerData($floor: Int, $search: String) {
    rooms(floor: $floor, search: $search) {
      id
      number
      floor
      type
      status
      currentEvent {
        id
        roomId
        title
        type
        startTime
        endTime
        dayOfWeek
        daysOfWeek
        date
        isOverride
        instructor
        notes
        validFrom
        validUntil
      }
      nextEvent {
        id
        roomId
        title
        type
        startTime
        endTime
        dayOfWeek
        daysOfWeek
        date
        isOverride
        instructor
        notes
        validFrom
        validUntil
      }
      devices {
        id
        name
        roomId
        roomNumber
        status
        assignedTo
      }
    }
    events {
      id
      roomId
      title
      type
      startTime
      endTime
      dayOfWeek
      daysOfWeek
      date
      isOverride
      instructor
      notes
      validFrom
      validUntil
    }
  }
`

const CREATE_SCHEDULE_EVENT = gql`
  mutation CreateScheduleEvent($input: ScheduleEventInput!) {
    createScheduleEvent(input: $input) {
      room {
        id
      }
    }
  }
`

const UPDATE_SCHEDULE_EVENT = gql`
  mutation UpdateScheduleEvent($id: ID!, $input: ScheduleEventInput!) {
    updateScheduleEvent(id: $id, input: $input) {
      room {
        id
      }
    }
  }
`

const DELETE_SCHEDULE_EVENT = gql`
  mutation DeleteScheduleEvent($id: ID!) {
    deleteScheduleEvent(id: $id)
  }
`

type SchedulerQueryResult = {
  rooms: Room[]
  events: ScheduleEvent[]
}

type Selection = {
  roomId: string
  dayOfWeek: number
  startSlot: number
  endSlot: number
}

type DraftForm = {
  title: string
  type: EventType
  recurrence: 'weekly' | 'daily' | 'one-time'
  startTime: string
  endTime: string
  validFrom: string
  validUntil: string
  date: string
  notes: string
}

type ScheduleEventMutationInput = {
  roomId: string
  title: string
  type: EventType
  startTime: string
  endTime: string
  daysOfWeek: number[]
  date?: string | null
  isOverride: boolean
  validFrom?: string | null
  validUntil?: string | null
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}

function slotToTime(slot: number): string {
  return minutesToTime(PLANNING_START_HOUR * 60 + slot * SLOT_MINUTES)
}

function clampEventToPlanningDay(event: ScheduleEvent) {
  const start = Math.max(timeToMinutes(event.startTime), PLANNING_START_HOUR * 60)
  const end = Math.min(timeToMinutes(event.endTime), PLANNING_END_HOUR * 60)

  if (end <= start) return null

  return {
    left: ((start - PLANNING_START_HOUR * 60) / DAY_MINUTES) * 100,
    width: ((end - start) / DAY_MINUTES) * 100,
  }
}

function getWeekStart(date: Date): Date {
  const copy = new Date(date)
  const day = copy.getDay() === 0 ? 7 : copy.getDay()
  copy.setDate(copy.getDate() - day + 1)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat('mn-MN', { month: '2-digit', day: '2-digit' }).format(date)
}

function eventOccursInWeekOnDay(event: ScheduleEvent, dayOfWeek: number, dayDate: string): boolean {
  if (event.isOverride) return event.date === dayDate
  if (!event.daysOfWeek.includes(dayOfWeek)) return false
  if (event.validFrom && dayDate < event.validFrom) return false
  if (event.validUntil && dayDate > event.validUntil) return false
  return true
}

function getEventTone(type: EventType) {
  switch (type) {
    case 'class':
      return 'border-l-[#2564cf] bg-[#eaf2ff] text-[#17375e]'
    case 'club':
      return 'border-l-[#7f5ccf] bg-[#f1ecff] text-[#3f2a76]'
    case 'openlab':
      return 'border-l-[#107c41] bg-[#e7f6ed] text-[#0b4f2a]'
    case 'closed':
      return 'border-l-[#d83b01] bg-[#fff4ce] text-[#5d2d00]'
    default:
      return 'border-l-[#616161] bg-muted text-foreground'
  }
}

function getEventLabel(type: EventType) {
  switch (type) {
    case 'class':
      return 'Элсэлт'
    case 'club':
      return 'Клуб'
    case 'openlab':
      return 'Open Lab'
    case 'closed':
      return 'Event'
    default:
      return 'Хуваарь'
  }
}

function shouldRenderTimelineEvent(event: ScheduleEvent) {
  return event.type !== 'openlab'
}

function createDefaultForm(selection: Selection, weekStart: Date): DraftForm {
  const selectedDate = toIsoDate(addDays(weekStart, selection.dayOfWeek - 1))

  return {
    title: '',
    type: 'club',
    recurrence: 'weekly',
    startTime: slotToTime(Math.min(selection.startSlot, selection.endSlot)),
    endTime: slotToTime(Math.max(selection.startSlot, selection.endSlot) + 1),
    validFrom: selectedDate,
    validUntil: '',
    date: selectedDate,
    notes: '',
  }
}

function createFormFromEvent(event: ScheduleEvent, dayOfWeek: number, weekStart: Date): DraftForm {
  const selectedDate = event.date ?? toIsoDate(addDays(weekStart, dayOfWeek - 1))

  return {
    title: event.title,
    type: event.type,
    recurrence: event.isOverride ? 'one-time' : event.daysOfWeek.length >= WORK_DAYS.length ? 'daily' : 'weekly',
    startTime: event.startTime,
    endTime: event.endTime,
    validFrom: event.validFrom ?? selectedDate,
    validUntil: event.validUntil ?? '',
    date: selectedDate,
    notes: event.notes ?? '',
  }
}

function createMutationInput(roomId: string, dayOfWeek: number, form: DraftForm): ScheduleEventMutationInput {
  const isOneTime = form.recurrence === 'one-time'

  return {
    roomId,
    title: form.title.trim(),
    type: form.type,
    startTime: form.startTime,
    endTime: form.endTime,
    daysOfWeek: form.recurrence === 'daily' ? WORK_DAYS.map(day => day.value) : [dayOfWeek],
    date: isOneTime ? form.date : null,
    isOverride: isOneTime,
    validFrom: isOneTime ? null : form.validFrom || null,
    validUntil: isOneTime ? null : form.validUntil || null,
  }
}

function buildLocalEvent(roomId: string, dayOfWeek: number, form: DraftForm): ScheduleEvent {
  const isOneTime = form.recurrence === 'one-time'

  return {
    id: `local-${crypto.randomUUID()}`,
    roomId,
    title: form.title.trim(),
    type: form.type,
    startTime: form.startTime,
    endTime: form.endTime,
    dayOfWeek,
    daysOfWeek: form.recurrence === 'daily' ? WORK_DAYS.map(day => day.value) : [dayOfWeek],
    date: isOneTime ? form.date : undefined,
    isOverride: isOneTime,
    validFrom: isOneTime ? undefined : form.validFrom || undefined,
    validUntil: isOneTime ? undefined : form.validUntil || undefined,
    notes: form.notes.trim() || undefined,
  }
}

export default function DashboardPage() {
  const { role } = useRole()

  if (role === 'admin') return <AdminScheduler />
  return <StudentDashboard />
}

function AdminScheduler() {
  const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()))
  const [selection, setSelection] = useState<Selection | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<DraftForm | null>(null)
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null)
  const [localEvents, setLocalEvents] = useState<ScheduleEvent[]>([])
  const [mutationError, setMutationError] = useState<string | null>(null)

  const { data, loading, error, refetch } = useQuery<SchedulerQueryResult>(GET_SCHEDULER_DATA)
  const [createScheduleEvent, { loading: saving }] = useMutation(CREATE_SCHEDULE_EVENT)
  const [updateScheduleEvent, { loading: updating }] = useMutation(UPDATE_SCHEDULE_EVENT)
  const [deleteScheduleEvent, { loading: deleting }] = useMutation(DELETE_SCHEDULE_EVENT)

  const rooms = useMemo(() => [...(data?.rooms ?? [])].sort((left, right) => left.number.localeCompare(right.number, 'mn', { numeric: true })), [data?.rooms])
  const events = useMemo(() => [...(data?.events ?? []), ...localEvents].filter(shouldRenderTimelineEvent), [data?.events, localEvents])
  const weekDates = useMemo(() => WORK_DAYS.map(day => toIsoDate(addDays(weekStart, day.value - 1))), [weekStart])
  const selectedRoom = selection ? rooms.find(room => room.id === selection.roomId) : null
  const selectedDay = selection ? WORK_DAYS.find(day => day.value === selection.dayOfWeek) : null

  const openCreateDialog = (targetSelection = selection) => {
    const fallbackSelection = rooms[0]
      ? { roomId: rooms[0].id, dayOfWeek: WORK_DAYS[0].value, startSlot: 0, endSlot: 1 }
      : null
    const nextSelection = targetSelection ?? fallbackSelection

    if (!nextSelection) return
    setSelection(nextSelection)
    setForm(createDefaultForm(nextSelection, weekStart))
    setEditingEvent(null)
    setMutationError(null)
    setDialogOpen(true)
  }

  const openEditDialog = (event: ScheduleEvent, roomId: string, dayOfWeek: number) => {
    const startSlot = Math.max(0, Math.floor((timeToMinutes(event.startTime) - PLANNING_START_HOUR * 60) / SLOT_MINUTES))
    const endSlot = Math.min(SLOT_COUNT - 1, Math.ceil((timeToMinutes(event.endTime) - PLANNING_START_HOUR * 60) / SLOT_MINUTES) - 1)

    setSelection({ roomId, dayOfWeek, startSlot, endSlot })
    setForm(createFormFromEvent(event, dayOfWeek, weekStart))
    setEditingEvent(event)
    setMutationError(null)
    setDialogOpen(true)
  }

  const handleSlotPointerDown = (roomId: string, dayOfWeek: number, slot: number, button: number) => {
    if (button !== 0) return
    setSelection({ roomId, dayOfWeek, startSlot: slot, endSlot: slot })
    setIsDragging(true)
  }

  const handleSlotPointerEnter = (roomId: string, dayOfWeek: number, slot: number) => {
    if (!isDragging) return
    setSelection(current => {
      if (!current || current.roomId !== roomId || current.dayOfWeek !== dayOfWeek) return current
      return { ...current, endSlot: slot }
    })
  }

  const handleContextMenu = (event: MouseEvent, roomId: string, dayOfWeek: number, slot: number) => {
    event.preventDefault()
    const targetSelection = selection?.roomId === roomId && selection.dayOfWeek === dayOfWeek
      ? selection
      : { roomId, dayOfWeek, startSlot: slot, endSlot: slot }

    openCreateDialog(targetSelection)
  }

  const handleSave = async () => {
    if (!selection || !form || !form.title.trim()) return

    const input = createMutationInput(selection.roomId, selection.dayOfWeek, form)

    try {
      setMutationError(null)
      if (editingEvent?.id.startsWith('local-')) {
        setLocalEvents(current => current.map(event => event.id === editingEvent.id ? { ...buildLocalEvent(selection.roomId, selection.dayOfWeek, form), id: editingEvent.id } : event))
      } else if (editingEvent) {
        await updateScheduleEvent({ variables: { id: editingEvent.id, input } })
      } else {
        await createScheduleEvent({ variables: { input } })
      }
      await refetch()
      setDialogOpen(false)
      setSelection(null)
      setEditingEvent(null)
    } catch (saveError) {
      if (editingEvent) {
        setMutationError(saveError instanceof Error ? saveError.message : 'Хуваарь хадгалж чадсангүй')
        return
      }

      setLocalEvents(current => [...current, buildLocalEvent(selection.roomId, selection.dayOfWeek, form)])
      setMutationError(saveError instanceof Error ? saveError.message : 'Хуваарь хадгалж чадсангүй')
      setDialogOpen(false)
      setSelection(null)
      setEditingEvent(null)
    }
  }

  const handleDelete = async () => {
    if (!editingEvent) return

    try {
      setMutationError(null)
      if (editingEvent.id.startsWith('local-')) {
        setLocalEvents(current => current.filter(event => event.id !== editingEvent.id))
      } else {
        await deleteScheduleEvent({ variables: { id: editingEvent.id } })
        await refetch()
      }
      setDialogOpen(false)
      setSelection(null)
      setEditingEvent(null)
    } catch (deleteError) {
      setMutationError(deleteError instanceof Error ? deleteError.message : 'Хуваарь устгаж чадсангүй')
    }
  }

  return (
    <section
      className="space-y-4"
      onPointerUp={() => setIsDragging(false)}
      onPointerLeave={() => setIsDragging(false)}
    >
      <div className="rounded-md border border-[#d1d1d1] bg-white shadow-sm dark:border-border dark:bg-card">
        <div className="flex flex-col gap-3 border-b border-[#e1dfdd] px-4 py-3 dark:border-border lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-md"
              onClick={() => setWeekStart(current => addDays(current, -7))}
              aria-label="Өмнөх долоо хоног"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex h-9 items-center gap-2 rounded-md border border-[#d1d1d1] bg-[#faf9f8] px-3 text-sm font-medium dark:border-border dark:bg-muted">
              <CalendarDays className="h-4 w-4 text-[#6264a7]" />
              {formatShortDate(weekStart)} - {formatShortDate(addDays(weekStart, 4))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-md"
              onClick={() => setWeekStart(current => addDays(current, 7))}
              aria-label="Дараагийн долоо хоног"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 rounded-md"
              onClick={() => setWeekStart(getWeekStart(new Date()))}
            >
              Өнөөдөр
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" size="icon" className="h-9 w-9 rounded-md" onClick={() => refetch()} aria-label="Дахин ачаалах">
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <Button type="button" className="h-9 rounded-md bg-[#6264a7] hover:bg-[#5558a7]" onClick={() => openCreateDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Шинэ
            </Button>
          </div>
        </div>

        <div className="overflow-auto">
          <div className="min-w-[1320px]">
            <div className="sticky top-0 z-[2] grid grid-cols-[128px_repeat(5,minmax(232px,1fr))] border-b border-[#e1dfdd] bg-white dark:border-border dark:bg-card">
              <div className="border-r border-[#e1dfdd] px-3 py-2 text-xs font-semibold uppercase text-muted-foreground dark:border-border">
                Анги
              </div>
              {WORK_DAYS.map((day, index) => (
                <div key={day.value} className="border-r border-[#e1dfdd] px-3 py-2 last:border-r-0 dark:border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold leading-5 text-foreground">{day.label}</p>
                      <p className="text-[11px] text-muted-foreground">{weekDates[index]}</p>
                    </div>
                    <Badge variant="outline" className="rounded-md text-[10px]">{day.short}</Badge>
                  </div>
                  <div className="mt-1.5 grid grid-cols-7 text-[10px] text-muted-foreground">
                    {HOUR_MARKS.slice(0, -1).map(hour => (
                      <span key={hour}>{hour}:00</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {loading && !data ? (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Ачаалж байна...</div>
            ) : error ? (
              <div className="m-4 rounded-md border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
                {error.message}
              </div>
            ) : rooms.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Анги олдсонгүй</div>
            ) : (
              rooms.map(room => (
                <div key={room.id} className="grid min-h-[64px] grid-cols-[128px_repeat(5,minmax(232px,1fr))] border-b border-[#edebe9] dark:border-border">
                  <Link
                    href={`/dashboard/room/${room.id}`}
                    className="flex flex-col justify-center border-r border-[#e1dfdd] bg-[#faf9f8] px-3 py-2 transition-colors hover:bg-[#f3f2f1] dark:border-border dark:bg-muted/30"
                  >
                    <span className="text-base font-semibold leading-5 text-foreground">{room.number}</span>
                    <span className="text-[11px] text-muted-foreground">{room.type === 'lab' ? 'Lab' : 'Event hall'}</span>
                  </Link>

                  {WORK_DAYS.map((day, dayIndex) => {
                    const dayDate = weekDates[dayIndex]
                    const dayEvents = events
                      .filter(event => event.roomId === room.id && eventOccursInWeekOnDay(event, day.value, dayDate))
                      .sort((left, right) => timeToMinutes(left.startTime) - timeToMinutes(right.startTime))
                    const activeSelection = selection?.roomId === room.id && selection.dayOfWeek === day.value ? selection : null
                    const selectedStart = activeSelection ? Math.min(activeSelection.startSlot, activeSelection.endSlot) : null
                    const selectedEnd = activeSelection ? Math.max(activeSelection.startSlot, activeSelection.endSlot) + 1 : null

                    return (
                      <div key={day.value} className="relative border-r border-[#edebe9] last:border-r-0 dark:border-border">
                        <div className="absolute inset-0 grid grid-cols-7">
                          {HOUR_MARKS.slice(0, -1).map(hour => (
                            <div key={hour} className="border-r border-[#f3f2f1] last:border-r-0 dark:border-border/60" />
                          ))}
                        </div>
                        <div className="absolute inset-0 grid grid-cols-7">
                          {SLOT_INDEXES.map(slot => (
                            <button
                              key={slot}
                              type="button"
                              className="relative z-[1] h-full cursor-crosshair border-r border-transparent outline-none transition-colors hover:bg-[#6264a7]/5"
                              onPointerDown={event => handleSlotPointerDown(room.id, day.value, slot, event.button)}
                              onPointerEnter={() => handleSlotPointerEnter(room.id, day.value, slot)}
                              onContextMenu={event => handleContextMenu(event, room.id, day.value, slot)}
                              aria-label={`${room.number} ${day.label} ${slotToTime(slot)}`}
                            />
                          ))}
                        </div>

                        {selectedStart != null && selectedEnd != null && (
                          <div
                            className="pointer-events-none absolute bottom-1.5 top-1.5 z-[2] rounded-md border border-[#6264a7] bg-[#6264a7]/15 shadow-[inset_0_0_0_1px_rgba(98,100,167,0.25)]"
                            style={{
                              left: `${(selectedStart / SLOT_COUNT) * 100}%`,
                              width: `${((selectedEnd - selectedStart) / SLOT_COUNT) * 100}%`,
                            }}
                          />
                        )}

                        {dayEvents.map(event => {
                          const position = clampEventToPlanningDay(event)
                          if (!position) return null

                          return (
                            <button
                              key={`${event.id}-${day.value}-${dayDate}`}
                              type="button"
                              className={cn(
                                'absolute bottom-1.5 top-1.5 z-[3] overflow-hidden rounded-md border border-[#d1d1d1] border-l-4 px-2 py-1 text-left text-xs shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md',
                                getEventTone(event.type)
                              )}
                              style={{ left: `${position.left}%`, width: `${position.width}%` }}
                              onClick={() => openEditDialog(event, room.id, day.value)}
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
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <MousePointer2 className="h-3.5 w-3.5" />
        <Legend color="bg-[#2564cf]" label="Элсэлт" />
        <Legend color="bg-[#7f5ccf]" label="Клуб" />
        <Legend color="bg-[#d83b01]" label="Event" />
        {mutationError && <span className="text-destructive">Түр draft хадгалсан: {mutationError}</span>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg rounded-md">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Хуваарь засах' : 'Хуваарь үүсгэх'}</DialogTitle>
            <DialogDescription>
              {selectedRoom?.number} · {selectedDay?.label} · {form?.startTime}-{form?.endTime}
            </DialogDescription>
          </DialogHeader>

          {form && (
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="schedule-title">Нэр</Label>
                <Input
                  id="schedule-title"
                  value={form.title}
                  onChange={event => setForm(current => current ? { ...current, title: event.target.value } : current)}
                  placeholder="Frontend Club"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label>Төрөл</Label>
                  <Select
                    value={form.type}
                    onValueChange={(value) => setForm(current => current ? {
                      ...current,
                      type: value as EventType,
                      recurrence: value === 'closed' ? 'one-time' : current.recurrence,
                    } : current)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="class">Элсэлт / Анги</SelectItem>
                      <SelectItem value="club">Клуб</SelectItem>
                      <SelectItem value="closed">Event</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Давтамж</Label>
                  <Select value={form.recurrence} onValueChange={(value) => setForm(current => current ? { ...current, recurrence: value as DraftForm['recurrence'] } : current)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="one-time">One-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="schedule-start">Эхлэх цаг</Label>
                  <Input
                    id="schedule-start"
                    type="time"
                    min="13:00"
                    max="20:00"
                    value={form.startTime}
                    onChange={event => setForm(current => current ? { ...current, startTime: event.target.value } : current)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="schedule-end">Дуусах цаг</Label>
                  <Input
                    id="schedule-end"
                    type="time"
                    min="13:00"
                    max="20:00"
                    value={form.endTime}
                    onChange={event => setForm(current => current ? { ...current, endTime: event.target.value } : current)}
                  />
                </div>
              </div>

              {form.recurrence === 'one-time' ? (
                <div className="grid gap-2">
                  <Label htmlFor="schedule-date">Огноо</Label>
                  <Input
                    id="schedule-date"
                    type="date"
                    value={form.date}
                    onChange={event => setForm(current => current ? { ...current, date: event.target.value } : current)}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="schedule-valid-from">{form.type === 'class' ? 'Элсэлт' : 'Эхлэх огноо'}</Label>
                    <Input
                      id="schedule-valid-from"
                      type="date"
                      value={form.validFrom}
                      onChange={event => setForm(current => current ? { ...current, validFrom: event.target.value } : current)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="schedule-valid-until">{form.type === 'class' ? 'Төгсөх' : 'Дуусах огноо'}</Label>
                    <Input
                      id="schedule-valid-until"
                      type="date"
                      value={form.validUntil}
                      onChange={event => setForm(current => current ? { ...current, validUntil: event.target.value } : current)}
                    />
                  </div>
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="schedule-notes">Тэмдэглэл</Label>
                <Textarea
                  id="schedule-notes"
                  value={form.notes}
                  onChange={event => setForm(current => current ? { ...current, notes: event.target.value } : current)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            {editingEvent && (
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Устгаж байна...' : 'Устгах'}
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Болих
            </Button>
            <Button type="button" className="bg-[#6264a7] hover:bg-[#5558a7]" onClick={handleSave} disabled={!form?.title.trim() || saving || updating}>
              {saving || updating ? 'Хадгалж байна...' : 'Хадгалах'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('h-2.5 w-2.5 rounded-sm', color)} />
      {label}
    </span>
  )
}

function StudentDashboard() {
  const { role, user } = useRole()

  const [selectedFloor, setSelectedFloor] = useState<3 | 4>(3)
  const [selectedStatus, setSelectedStatus] = useState<RoomStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearchQuery = useDeferredValue(searchQuery)

  const { data, loading, error, refetch } = useQuery<{ rooms: Room[] }>(GET_SCHEDULER_DATA, {
    variables: {
      floor: selectedFloor,
      search: deferredSearchQuery.trim() || null,
    },
  })

  useTimelineLiveUpdates({
    enabled: !loading,
    onEventsChanged: () => refetch(),
  })

  const floorRooms = data?.rooms ?? []

  const filteredRooms = useMemo(() => {
    return floorRooms.filter(room => selectedStatus === 'all' || room.status === selectedStatus)
  }, [floorRooms, selectedStatus])

  const roomSummary = useMemo(() => {
    const counts = {
      open: 0,
      class: 0,
      club: 0,
      unavailable: 0,
    }

    for (const room of floorRooms) {
      if (room.status === 'club') counts.club += 1
      else if (room.status === 'class') counts.class += 1
      else if (room.status === 'closed') counts.unavailable += 1
      else counts.open += 1
    }

    return counts
  }, [floorRooms])

  const isStudent = role === 'student'
  const userDevice = user?.assignedDevice
  const statusBadges: Array<{
    key: RoomStatus
    label: string
    count: number
    activeClasses: string
    inactiveClasses: string
  }> = [
    {
      key: 'class',
      label: STATUS_CONFIG.class.label,
      count: roomSummary.class,
      activeClasses: 'border-blue-600 bg-blue-600 text-white hover:bg-blue-600/90',
      inactiveClasses: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
    },
    {
      key: 'club',
      label: STATUS_CONFIG.club.label,
      count: roomSummary.club,
      activeClasses: 'border-violet-600 bg-violet-600 text-white hover:bg-violet-600/90',
      inactiveClasses: 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100',
    },
    {
      key: 'available',
      label: 'Open Lab',
      count: roomSummary.open,
      activeClasses: 'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-600/90',
      inactiveClasses: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    },
    {
      key: 'closed',
      label: 'Event',
      count: roomSummary.unavailable,
      activeClasses: 'border-amber-600 bg-amber-600 text-white hover:bg-amber-600/90',
      inactiveClasses: 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100',
    },
  ]

  return (
    <section className="overflow-hidden rounded-md border border-border bg-card">
      <div className="border-b border-border p-4 sm:p-5">
        <RoomFilterBar
          selectedFloor={selectedFloor}
          selectedStatus={selectedStatus}
          searchQuery={searchQuery}
          roomCount={filteredRooms.length}
          onFloorChange={setSelectedFloor}
          onStatusChange={setSelectedStatus}
          onSearchChange={setSearchQuery}
          showScheduleLink={false}
          embedded
        />
      </div>

      <div className="p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {statusBadges.map((badge) => {
            const isActive = selectedStatus === badge.key

            return (
              <Button
                key={badge.key}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedStatus(isActive ? 'all' : badge.key)}
                className={isActive ? badge.activeClasses : badge.inactiveClasses}
              >
                {badge.label}: {badge.count}
              </Button>
            )
          })}
        </div>

        {error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-8 text-center">
            <p className="font-medium text-destructive">Өрөөнүүдийг ачаалж чадсангүй</p>
            <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
              Дахин оролдох
            </Button>
          </div>
        ) : loading && !data ? (
          <div className="rounded-md border border-dashed border-border bg-background/60 p-8 text-center">
            <p className="text-muted-foreground">Өрөөнүүдийг ачаалж байна...</p>
          </div>
        ) : filteredRooms.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRooms.map(room => (
              <RoomCard
                key={room.id}
                room={room}
                showDeviceInfo={isStudent && userDevice != null && userDevice.roomId === room.id}
                assignedDeviceName={userDevice != null && userDevice.roomId === room.id ? userDevice.name : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-border bg-background/60 p-8 text-center">
            <p className="text-muted-foreground">Хайлтын үр дүн олдсонгүй</p>
          </div>
        )}
      </div>
    </section>
  )
}
