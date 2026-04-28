'use client'

import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RoomCard } from '@/components/rooms/room-card'
import { RoomFilterBar } from '@/components/rooms/room-filter-bar'
import { STATUS_CONFIG } from '@/lib/constants'
import { useTimelineLiveUpdates } from '@/lib/use-timeline-live-updates'
import { useRole } from '@/lib/role-context'
import { cn } from '@/lib/utils'
import type { EventType, Room, RoomStatus, ScheduleEvent } from '@/lib/types'

const PLANNING_START_HOUR = 9
const PLANNING_END_HOUR = 20
const SLOT_MINUTES = 30
const DAY_VIEW_SLOT_MINUTES = SLOT_MINUTES
const DAY_MINUTES = (PLANNING_END_HOUR - PLANNING_START_HOUR) * 60

const WORK_DAYS = [
  { value: 1, label: 'Даваа', short: 'Mon' },
  { value: 2, label: 'Мягмар', short: 'Tue' },
  { value: 3, label: 'Лхагва', short: 'Wed' },
  { value: 4, label: 'Пүрэв', short: 'Thu' },
  { value: 5, label: 'Баасан', short: 'Fri' },
  { value: 6, label: 'Бямба', short: 'Sat' },
  { value: 7, label: 'Ням', short: 'Sun' },
] as const

const CALENDAR_DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] as const

const HOUR_MARKS = Array.from({ length: PLANNING_END_HOUR - PLANNING_START_HOUR + 1 }, (_, index) => PLANNING_START_HOUR + index)
const VISIBLE_HOUR_MARKS = HOUR_MARKS.slice(0, -1).filter(hour => (hour - PLANNING_START_HOUR) % 2 === 0 || hour === PLANNING_END_HOUR - 1)
const HOUR_COUNT = PLANNING_END_HOUR - PLANNING_START_HOUR
const SLOT_COUNT = DAY_MINUTES / SLOT_MINUTES
const SLOT_INDEXES = Array.from({ length: SLOT_COUNT }, (_, index) => index)
const DAY_VIEW_SLOT_COUNT = SLOT_COUNT
const DAY_VIEW_SLOT_INDEXES = SLOT_INDEXES
const HOUR_GRID_TEMPLATE = `repeat(${HOUR_COUNT}, minmax(0, 1fr))`
const SLOT_GRID_TEMPLATE = `repeat(${SLOT_COUNT}, minmax(0, 1fr))`
const SCHEDULER_GRID_TEMPLATE = '104px repeat(7, minmax(280px, 1fr))'

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
  slotMinutes: number
}

type SchedulerViewMode = 'day' | 'week'

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

function slotToTime(slot: number, slotMinutes: number): string {
  return minutesToTime(PLANNING_START_HOUR * 60 + slot * slotMinutes)
}

function normalizeTimelineTime(time: string): string {
  const min = PLANNING_START_HOUR * 60
  const max = PLANNING_END_HOUR * 60
  const clamped = Math.min(max, Math.max(min, timeToMinutes(time)))
  return minutesToTime(Math.round(clamped / SLOT_MINUTES) * SLOT_MINUTES)
}

function clampEventToPlanningDay(event: ScheduleEvent, slotMinutes: number = SLOT_MINUTES) {
  const start = Math.max(timeToMinutes(event.startTime), PLANNING_START_HOUR * 60)
  const end = Math.min(timeToMinutes(event.endTime), PLANNING_END_HOUR * 60)

  if (end <= start) return null

  return {
    left: ((start - PLANNING_START_HOUR * 60) / DAY_MINUTES) * 100,
    width: ((end - start) / DAY_MINUTES) * 100,
    slotWidth: ((slotMinutes / DAY_MINUTES) * 100),
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
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function addDays(date: Date, days: number): Date {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

function addMonths(date: Date, months: number): Date {
  const copy = new Date(date)
  copy.setMonth(copy.getMonth() + months)
  copy.setDate(1)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function getMonthStart(date: Date): Date {
  const copy = new Date(date)
  copy.setDate(1)
  copy.setHours(0, 0, 0, 0)
  return copy
}

function getCalendarGridStart(date: Date): Date {
  const monthStart = getMonthStart(date)
  return addDays(monthStart, -monthStart.getDay())
}

function getMonthDays(date: Date): Date[] {
  const start = getCalendarGridStart(date)
  return Array.from({ length: 42 }, (_, index) => addDays(start, index))
}

function isSameDate(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate()
}

function isSameMonth(left: Date, right: Date): boolean {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth()
}

function isDateInSelectedWeek(date: Date, weekStart: Date): boolean {
  const visibleWeekStart = addDays(weekStart, -1)
  const visibleWeekEnd = addDays(weekStart, 5)
  const target = new Date(date)

  target.setHours(0, 0, 0, 0)
  return target >= visibleWeekStart && target <= visibleWeekEnd
}

function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat('mn-MN', { month: '2-digit', day: '2-digit' }).format(date)
}

function formatMonthLabel(date: Date): string {
  const month = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date)
  return `${date.getFullYear()} ${month}`
}

function formatWeekdayName(date: Date): string {
  return new Intl.DateTimeFormat('mn-MN', { weekday: 'long' }).format(date)
}

function formatMonthDayLabel(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { month: '2-digit', day: '2-digit' }).format(date)
}

function isDateBefore(left: Date, right: Date) {
  return left.getTime() < right.getTime()
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
    startTime: slotToTime(Math.min(selection.startSlot, selection.endSlot), selection.slotMinutes),
    endTime: slotToTime(Math.max(selection.startSlot, selection.endSlot) + 1, selection.slotMinutes),
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
  const startTime = normalizeTimelineTime(form.startTime)
  const endTime = normalizeTimelineTime(form.endTime)

  return {
    roomId,
    title: form.title.trim(),
    type: form.type,
    startTime,
    endTime,
    daysOfWeek: form.recurrence === 'daily' ? WORK_DAYS.map(day => day.value) : [dayOfWeek],
    date: isOneTime ? form.date : null,
    isOverride: isOneTime,
    validFrom: isOneTime ? null : form.validFrom || null,
    validUntil: isOneTime ? null : form.validUntil || null,
  }
}

function buildLocalEvent(roomId: string, dayOfWeek: number, form: DraftForm): ScheduleEvent {
  const isOneTime = form.recurrence === 'one-time'
  const startTime = normalizeTimelineTime(form.startTime)
  const endTime = normalizeTimelineTime(form.endTime)

  return {
    id: `local-${crypto.randomUUID()}`,
    roomId,
    title: form.title.trim(),
    type: form.type,
    startTime,
    endTime,
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
  const [calendarMonth, setCalendarMonth] = useState(() => getMonthStart(new Date()))
  const [viewMode, setViewMode] = useState<SchedulerViewMode>('week')
  const [focusedDate, setFocusedDate] = useState(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  })
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [weekMotionClass, setWeekMotionClass] = useState('opacity-100 translate-x-0 scale-100')
  const [selection, setSelection] = useState<Selection | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<DraftForm | null>(null)
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null)
  const [localEvents, setLocalEvents] = useState<ScheduleEvent[]>([])
  const [mutationError, setMutationError] = useState<string | null>(null)
  const [selectedRoomTab, setSelectedRoomTab] = useState<string>('all')

  const { data, loading, error, refetch } = useQuery<SchedulerQueryResult>(GET_SCHEDULER_DATA)
  const [createScheduleEvent, { loading: saving }] = useMutation(CREATE_SCHEDULE_EVENT)
  const [updateScheduleEvent, { loading: updating }] = useMutation(UPDATE_SCHEDULE_EVENT)
  const [deleteScheduleEvent, { loading: deleting }] = useMutation(DELETE_SCHEDULE_EVENT)

  const rooms = useMemo(() => [...(data?.rooms ?? [])].sort((left, right) => left.number.localeCompare(right.number, 'mn', { numeric: true })), [data?.rooms])
  const events = useMemo(() => [...(data?.events ?? []), ...localEvents].filter(shouldRenderTimelineEvent), [data?.events, localEvents])
  const weekDates = useMemo(() => WORK_DAYS.map(day => toIsoDate(addDays(weekStart, day.value - 1))), [weekStart])
  const monthDays = useMemo(() => getMonthDays(calendarMonth), [calendarMonth])
  const focusedDateLabel = useMemo(
    () => new Intl.DateTimeFormat('mn-MN', { month: '2-digit', day: '2-digit', weekday: 'long' }).format(focusedDate),
    [focusedDate]
  )
  const focusedDateTitle = useMemo(
    () => `${formatWeekdayName(focusedDate)} · ${formatMonthDayLabel(focusedDate)}`,
    [focusedDate]
  )
  const focusedDateIso = useMemo(() => toIsoDate(focusedDate), [focusedDate])
  const focusedDayOfWeek = useMemo(() => {
    const day = focusedDate.getDay()
    return day === 0 ? 7 : day
  }, [focusedDate])
  const selectedRoomView = useMemo(
    () => selectedRoomTab === 'all' ? null : rooms.find(room => room.id === selectedRoomTab) ?? null,
    [rooms, selectedRoomTab]
  )
  const roomsForDayView = useMemo(
    () => selectedRoomView ? [selectedRoomView] : rooms,
    [rooms, selectedRoomView]
  )
  const selectedRoom = selection ? rooms.find(room => room.id === selection.roomId) : null
  const selectedDay = selection ? WORK_DAYS.find(day => day.value === selection.dayOfWeek) : null
  const selectedDayLabel = selection ? formatWeekdayName(addDays(weekStart, selection.dayOfWeek - 1)) : null
  const previousWeekStartRef = useRef(weekStart)

  useEffect(() => {
    const previousWeekStart = previousWeekStartRef.current

    if (previousWeekStart.getTime() === weekStart.getTime()) return

    const entersFromRight = isDateBefore(previousWeekStart, weekStart)
    setWeekMotionClass(entersFromRight ? 'opacity-0 translate-x-10 scale-[0.985]' : 'opacity-0 -translate-x-10 scale-[0.985]')

    const frameId = requestAnimationFrame(() => {
      setWeekMotionClass('opacity-100 translate-x-0 scale-100')
    })

    previousWeekStartRef.current = weekStart

    return () => cancelAnimationFrame(frameId)
  }, [weekStart])

  const updateWeekStart = (date: Date) => {
    const normalizedDate = new Date(date)
    normalizedDate.setHours(0, 0, 0, 0)
    const nextWeekStart = getWeekStart(date)
    setWeekStart(nextWeekStart)
    setCalendarMonth(getMonthStart(nextWeekStart))
    setFocusedDate(normalizedDate)
  }

  const handleShiftWeek = (days: number) => {
    if (viewMode === 'day') {
      const nextDate = addDays(focusedDate, days > 0 ? 1 : -1)
      updateWeekStart(nextDate)
      return
    }

    setWeekStart(current => {
      const next = addDays(current, days)
      setCalendarMonth(getMonthStart(next))
      setFocusedDate(next)
      return next
    })
  }

  useEffect(() => {
    if (selectedRoomTab === 'all') return
    const roomExists = rooms.some(room => room.id === selectedRoomTab)
    if (!roomExists) {
      setSelectedRoomTab('all')
    }
  }, [rooms, selectedRoomTab])

  const openCreateDialog = (targetSelection = selection) => {
    const fallbackSelection = rooms[0]
      ? {
        roomId: rooms[0].id,
        dayOfWeek: viewMode === 'day' ? focusedDayOfWeek : WORK_DAYS[0].value,
        startSlot: 0,
        endSlot: 1,
        slotMinutes: viewMode === 'day' ? DAY_VIEW_SLOT_MINUTES : SLOT_MINUTES,
      }
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
    const slotMinutes = viewMode === 'day' ? DAY_VIEW_SLOT_MINUTES : SLOT_MINUTES
    const slotCount = viewMode === 'day' ? DAY_VIEW_SLOT_COUNT : SLOT_COUNT
    const startSlot = Math.max(0, Math.floor((timeToMinutes(event.startTime) - PLANNING_START_HOUR * 60) / slotMinutes))
    const endSlot = Math.min(slotCount - 1, Math.ceil((timeToMinutes(event.endTime) - PLANNING_START_HOUR * 60) / slotMinutes) - 1)

    setSelection({ roomId, dayOfWeek, startSlot, endSlot, slotMinutes })
    setForm(createFormFromEvent(event, dayOfWeek, weekStart))
    setEditingEvent(event)
    setMutationError(null)
    setDialogOpen(true)
  }

  const handleSlotPointerDown = (roomId: string, dayOfWeek: number, slot: number, slotMinutes: number, button: number) => {
    if (button !== 0) return
    setSelection({ roomId, dayOfWeek, startSlot: slot, endSlot: slot, slotMinutes })
    setIsDragging(true)
  }

  const handleSlotPointerEnter = (roomId: string, dayOfWeek: number, slot: number) => {
    if (!isDragging) return
    setSelection(current => {
      if (!current || current.roomId !== roomId || current.dayOfWeek !== dayOfWeek) return current
      return { ...current, endSlot: slot }
    })
  }

  const handleContextMenu = (event: MouseEvent, roomId: string, dayOfWeek: number, slot: number, slotMinutes: number) => {
    event.preventDefault()
    const targetSelection = selection?.roomId === roomId && selection.dayOfWeek === dayOfWeek
      ? selection
      : { roomId, dayOfWeek, startSlot: slot, endSlot: slot, slotMinutes }

    openCreateDialog(targetSelection)
  }

  const handleSave = async () => {
    if (!selection || !form || !form.title.trim()) return
    if (timeToMinutes(normalizeTimelineTime(form.endTime)) <= timeToMinutes(normalizeTimelineTime(form.startTime))) {
      setMutationError('Дуусах цаг эхлэх цагаас хойш байх ёстой.')
      return
    }

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
      className={cn(
        'space-y-4 transition-[padding-right] duration-200',
        dialogOpen ? 'xl:pr-[26rem]' : 'pr-0',
      )}
      onPointerUp={() => setIsDragging(false)}
      onPointerLeave={() => setIsDragging(false)}
    >
      <div className="rounded-md border border-[#d1d1d1] bg-white shadow-sm dark:border-border dark:bg-card">
        <div className="flex flex-col gap-3 border-b border-[#e1dfdd] px-4 py-3 dark:border-border lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-xl border border-[#d7d8f4] bg-[#f8f9ff] p-1 dark:border-[#3b3d62] dark:bg-[#1e2031]">
              <button
                type="button"
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                  viewMode === 'week'
                    ? 'bg-white text-foreground shadow-sm dark:bg-[#2b3150] dark:text-white'
                    : 'text-muted-foreground hover:text-foreground dark:hover:text-white'
                )}
                onClick={() => setViewMode('week')}
              >
                Week
              </button>
              <button
                type="button"
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                  viewMode === 'day'
                    ? 'bg-white text-foreground shadow-sm dark:bg-[#2b3150] dark:text-white'
                    : 'text-muted-foreground hover:text-foreground dark:hover:text-white'
                )}
                onClick={() => setViewMode('day')}
              >
                Day
              </button>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-xl"
              onClick={() => handleShiftWeek(-7)}
              aria-label="Өмнөх долоо хоног"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <button
              type="button"
              className="flex min-w-[196px] items-center gap-2.5 rounded-xl border border-[#d7d8f4] bg-[#f8f9ff] px-3.5 py-2 text-left shadow-sm transition hover:border-[#6264a7] hover:bg-[#eef0ff] dark:border-[#3b3d62] dark:bg-[#1e2031] dark:hover:border-[#8a8dd8] dark:hover:bg-[#252845]"
              onClick={() => setIsCalendarOpen(current => !current)}
              aria-expanded={isCalendarOpen}
              aria-label="Календарь харах"
            >
              <CalendarDays className="h-4 w-4 shrink-0 text-[#6264a7]" />
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-5 text-foreground">{formatMonthLabel(calendarMonth)}</p>
                <p className="text-xs text-muted-foreground">
                  {viewMode === 'day'
                    ? 'Day view'
                    : `${formatShortDate(weekStart)} - ${formatShortDate(addDays(weekStart, 4))}`}
                </p>
              </div>
            </button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-xl"
              onClick={() => handleShiftWeek(7)}
              aria-label="Дараагийн долоо хоног"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-xl px-3"
              onClick={() => updateWeekStart(new Date())}
            >
              Өнөөдөр
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" className="h-9 rounded-md bg-[#6264a7] hover:bg-[#5558a7]" onClick={() => openCreateDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Шинэ
            </Button>
          </div>
        </div>

        <Tabs value={selectedRoomTab} onValueChange={setSelectedRoomTab} className="gap-0">
          <div className="grid gap-3 p-3 xl:grid-cols-[212px_minmax(0,1fr)]">
            <aside
              className={cn(
                isCalendarOpen ? 'block' : 'hidden',
                'rounded-2xl border border-[#e5e7f3] bg-[#fbfbfe] p-3 shadow-sm dark:border-[#2c3149] dark:bg-[#171b27] xl:sticky xl:top-4 xl:block'
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{formatMonthLabel(calendarMonth)}</p>
                  <p className="text-xs text-muted-foreground">
                    {viewMode === 'day'
                      ? 'Өдөр сонгоод баруун талын timeline-г шинэчилнэ'
                      : `Сонгосон 7 хоног: ${formatShortDate(weekStart)} - ${formatShortDate(addDays(weekStart, 6))}`}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                    onClick={() => setCalendarMonth(current => addMonths(current, -1))}
                    aria-label="Өмнөх сар"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                    onClick={() => setCalendarMonth(current => addMonths(current, 1))}
                    aria-label="Дараагийн сар"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mb-1.5 grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-muted-foreground">
                {CALENDAR_DAY_LETTERS.map((letter, index) => (
                  <span key={`${letter}-${index}`} className="py-1">{letter}</span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {monthDays.map(day => {
                  const inCurrentMonth = isSameMonth(day, calendarMonth)
                  const inSelectedWeek = isDateInSelectedWeek(day, weekStart)
                  const isToday = isSameDate(day, new Date())

                  return (
                    <button
                      key={toIsoDate(day)}
                      type="button"
                      className={cn(
                        'flex h-8 items-center justify-center rounded-lg border text-[13px] font-medium transition',
                        viewMode === 'day' && isSameDate(day, focusedDate) && 'border-[#6264a7] bg-[#dfe3ff] text-[#282f5f] dark:border-[#99a0ff] dark:bg-[#36406e] dark:text-white',
                        viewMode === 'week' && inSelectedWeek
                          ? 'border-[#7b7fd6] bg-[#eceeff] text-[#323769] shadow-sm dark:border-[#8e92ff]/70 dark:bg-[#2a3152] dark:text-white'
                          : 'border-transparent text-foreground/80 hover:border-[#d7d8f4] hover:bg-white dark:hover:border-[#353b59] dark:hover:bg-[#1f2434]',
                        !inCurrentMonth && 'text-muted-foreground/45',
                        isToday && !inSelectedWeek && 'border-[#c9cdfa] text-foreground dark:border-[#6166a7]'
                      )}
                      onClick={() => updateWeekStart(day)}
                      aria-label={day.toDateString()}
                    >
                      {day.getDate()}
                    </button>
                  )
                })}
              </div>

              <div className="mt-3 rounded-xl border border-dashed border-[#d7d8f4] bg-white/70 px-3 py-2 text-[11px] text-muted-foreground dark:border-[#323858] dark:bg-[#111522]">
                {viewMode === 'day'
                  ? 'Өдөр дээр дармагц баруун талын day timeline шинэчлэгдэнэ.'
                  : 'Өдөр дээр дармагц тухайн долоо хоногийн хуваарь баруун талд шинэчлэгдэнэ.'}
              </div>
            </aside>

            <div className={cn('min-w-0 overflow-hidden rounded-2xl border border-[#e8e8eb] bg-white shadow-sm transition-all duration-500 ease-out dark:border-border dark:bg-card', weekMotionClass)}>
              <div className="border-b border-[#e1dfdd] px-4 py-3 dark:border-border">
                <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-md border border-[#e1dfdd] bg-[#faf9f8] p-1 dark:border-border dark:bg-muted/30">
                  <TabsTrigger value="all" className="min-w-fit px-3">
                    All classes
                  </TabsTrigger>
                  {rooms.map(room => (
                    <TabsTrigger key={room.id} value={room.id} className="min-w-fit px-3">
                      {room.number}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <div className="overflow-auto">
                {viewMode === 'week' ? (
                  selectedRoomTab === 'all' ? (
                    <div className="min-w-max">
                      <div className="sticky top-0 z-[2] grid border-b border-[#e1dfdd] bg-white dark:border-border dark:bg-card" style={{ gridTemplateColumns: SCHEDULER_GRID_TEMPLATE }}>
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
                            <div className="relative mt-1.5 h-4 text-[10px] text-muted-foreground">
                              {VISIBLE_HOUR_MARKS.map(hour => (
                                <span
                                  key={hour}
                                  className="absolute top-0 -translate-x-1/2 whitespace-nowrap"
                                  style={{ left: `${((hour - PLANNING_START_HOUR) / HOUR_COUNT) * 100}%` }}
                                >
                                  {hour}:00
                                </span>
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
                      <div key={room.id} className="grid min-h-[64px] border-b border-[#edebe9] dark:border-border" style={{ gridTemplateColumns: SCHEDULER_GRID_TEMPLATE }}>
                        <Link
                          href={`/dashboard/room/${room.id}`}
                          className="flex flex-col justify-center border-r border-[#e1dfdd] bg-[#faf9f8] px-2.5 py-2 transition-colors hover:bg-[#f3f2f1] dark:border-border dark:bg-muted/30"
                        >
                          <span className="text-[15px] font-semibold leading-5 text-foreground">{room.number}</span>
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
                              <div className="absolute inset-0 grid" style={{ gridTemplateColumns: HOUR_GRID_TEMPLATE }}>
                                {HOUR_MARKS.slice(0, -1).map(hour => (
                                  <div key={hour} className="border-r border-[#f3f2f1] last:border-r-0 dark:border-border/60" />
                                ))}
                              </div>
                              <div className="absolute inset-0 grid" style={{ gridTemplateColumns: SLOT_GRID_TEMPLATE }}>
                                {SLOT_INDEXES.map(slot => (
                                  <button
                                    key={slot}
                                    type="button"
                                    className="relative z-[1] h-full cursor-crosshair border-r border-transparent outline-none transition-colors hover:bg-[#6264a7]/5"
                                    onPointerDown={event => handleSlotPointerDown(room.id, day.value, slot, SLOT_MINUTES, event.button)}
                                    onPointerEnter={() => handleSlotPointerEnter(room.id, day.value, slot)}
                                    onContextMenu={event => handleContextMenu(event, room.id, day.value, slot, SLOT_MINUTES)}
                                    aria-label={`${room.number} ${day.label} ${slotToTime(slot, SLOT_MINUTES)}`}
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
                                const position = clampEventToPlanningDay(event, SLOT_MINUTES)
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
                  ) : (
                    <div className="p-4">
                      <RoomWeeklySchedule
                        room={selectedRoomView}
                        events={events}
                        onEditEvent={(event, dayOfWeek) => {
                          if (!selectedRoomView) return
                          openEditDialog(event, selectedRoomView.id, dayOfWeek)
                        }}
                      />
                    </div>
                  )
                ) : (
                  <div className="min-w-[980px]">
                    <div className="sticky top-0 z-[2] grid grid-cols-[104px_minmax(860px,1fr)] border-b border-[#e1dfdd] bg-white dark:border-border dark:bg-card">
                      <div className="border-r border-[#e1dfdd] px-2.5 py-2 text-[11px] font-semibold uppercase text-muted-foreground dark:border-border">
                        Анги
                      </div>
                      <div className="px-3 py-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold leading-5 text-foreground">{focusedDateTitle}</p>
                            <p className="text-[11px] text-muted-foreground">30 минутын нарийвчлалтай day timeline</p>
                          </div>
                        </div>
                        <div
                          className="mt-2 grid text-[10px] text-muted-foreground"
                          style={{ gridTemplateColumns: `repeat(${DAY_VIEW_SLOT_COUNT}, minmax(0, 1fr))` }}
                        >
                          {DAY_VIEW_SLOT_INDEXES.map(slot => (
                            <span key={slot}>{slotToTime(slot, DAY_VIEW_SLOT_MINUTES)}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {loading && !data ? (
                      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Ачаалж байна...</div>
                    ) : error ? (
                      <div className="m-4 rounded-md border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
                        {error.message}
                      </div>
                    ) : roomsForDayView.length === 0 ? (
                      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">Анги олдсонгүй</div>
                    ) : (
                      roomsForDayView.map(room => {
                        const dayEvents = events
                          .filter(event => event.roomId === room.id && eventOccursInWeekOnDay(event, focusedDayOfWeek, focusedDateIso))
                          .sort((left, right) => timeToMinutes(left.startTime) - timeToMinutes(right.startTime))
                        const activeSelection = selection?.roomId === room.id && selection.dayOfWeek === focusedDayOfWeek ? selection : null
                        const selectedStart = activeSelection ? Math.min(activeSelection.startSlot, activeSelection.endSlot) : null
                        const selectedEnd = activeSelection ? Math.max(activeSelection.startSlot, activeSelection.endSlot) + 1 : null

                        return (
                          <div key={room.id} className="grid min-h-[84px] grid-cols-[104px_minmax(860px,1fr)] border-b border-[#edebe9] dark:border-border">
                            <Link
                              href={`/dashboard/room/${room.id}`}
                              className="flex flex-col justify-center border-r border-[#e1dfdd] bg-[#faf9f8] px-2.5 py-2 transition-colors hover:bg-[#f3f2f1] dark:border-border dark:bg-muted/30"
                            >
                              <span className="text-[15px] font-semibold leading-5 text-foreground">{room.number}</span>
                              <span className="text-[11px] text-muted-foreground">{room.type === 'lab' ? 'Lab' : 'Event hall'}</span>
                            </Link>

                            <div className="relative">
                              <div
                                className="absolute inset-0 grid"
                                style={{ gridTemplateColumns: `repeat(${DAY_VIEW_SLOT_COUNT}, minmax(0, 1fr))` }}
                              >
                                {DAY_VIEW_SLOT_INDEXES.map(slot => (
                                  <div key={slot} className="border-r border-[#f0f1f8] last:border-r-0 dark:border-border/60" />
                                ))}
                              </div>
                              <div
                                className="absolute inset-0 grid"
                                style={{ gridTemplateColumns: `repeat(${DAY_VIEW_SLOT_COUNT}, minmax(0, 1fr))` }}
                              >
                                {DAY_VIEW_SLOT_INDEXES.map(slot => (
                                  <button
                                    key={slot}
                                    type="button"
                                    className="relative z-[1] h-full cursor-crosshair border-r border-transparent outline-none transition-colors hover:bg-[#6264a7]/5"
                                    onPointerDown={event => handleSlotPointerDown(room.id, focusedDayOfWeek, slot, DAY_VIEW_SLOT_MINUTES, event.button)}
                                    onPointerEnter={() => handleSlotPointerEnter(room.id, focusedDayOfWeek, slot)}
                                    onContextMenu={event => handleContextMenu(event, room.id, focusedDayOfWeek, slot, DAY_VIEW_SLOT_MINUTES)}
                                    aria-label={`${room.number} ${focusedDateLabel} ${slotToTime(slot, DAY_VIEW_SLOT_MINUTES)}`}
                                  />
                                ))}
                              </div>

                              {selectedStart != null && selectedEnd != null && (
                                <div
                                  className="pointer-events-none absolute bottom-2 top-2 z-[2] rounded-lg border border-[#6264a7] bg-[#6264a7]/15 shadow-[inset_0_0_0_1px_rgba(98,100,167,0.25)]"
                                  style={{
                                    left: `${(selectedStart / DAY_VIEW_SLOT_COUNT) * 100}%`,
                                    width: `${((selectedEnd - selectedStart) / DAY_VIEW_SLOT_COUNT) * 100}%`,
                                  }}
                                />
                              )}

                              {dayEvents.map(event => {
                                const position = clampEventToPlanningDay(event, DAY_VIEW_SLOT_MINUTES)
                                if (!position) return null

                                return (
                                  <button
                                    key={`${event.id}-${focusedDateIso}-${room.id}`}
                                    type="button"
                                    className={cn(
                                      'absolute bottom-2 top-2 z-[3] overflow-hidden rounded-lg border border-[#d1d1d1] border-l-4 px-2.5 py-1.5 text-left text-xs shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md',
                                      getEventTone(event.type)
                                    )}
                                    style={{ left: `${position.left}%`, width: `${position.width}%` }}
                                    onClick={() => openEditDialog(event, room.id, focusedDayOfWeek)}
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
                )}
              </div>
            </div>
          </div>
        </Tabs>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <MousePointer2 className="h-3.5 w-3.5" />
        <Legend color="bg-[#2564cf]" label="Элсэлт" />
        <Legend color="bg-[#7f5ccf]" label="Клуб" />
        <Legend color="bg-[#d83b01]" label="Event" />
        {mutationError && <span className="text-destructive">Түр draft хадгалсан: {mutationError}</span>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={false}>
        <DialogContent
          showOverlay={false}
          className="left-auto right-0 top-0 h-screen w-full max-w-md translate-x-0 translate-y-0 overflow-y-auto rounded-none border-y-0 border-r-0 p-5 sm:max-w-md"
        >
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Хуваарь засах' : 'Хуваарь үүсгэх'}</DialogTitle>
            <DialogDescription>
              {selectedRoom?.number} · {selectedDay?.label ?? selectedDayLabel} · {form?.startTime}-{form?.endTime}
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
                    min="09:00"
                    max="20:00"
                    step={SLOT_MINUTES * 60}
                    value={form.startTime}
                    onChange={event => setForm(current => current ? { ...current, startTime: event.target.value } : current)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="schedule-end">Дуусах цаг</Label>
                  <Input
                    id="schedule-end"
                    type="time"
                    min="09:00"
                    max="20:00"
                    step={SLOT_MINUTES * 60}
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

function RoomWeeklySchedule({
  room,
  events,
  onEditEvent,
}: {
  room: Room | null
  events: ScheduleEvent[]
  onEditEvent: (_event: ScheduleEvent, _dayOfWeek: number) => void
}) {
  const GRID_START_HOUR = 8
  const GRID_END_HOUR = 20
  const HOUR_HEIGHT = 48
  const gridStartMinutes = GRID_START_HOUR * 60
  const gridEndMinutes = GRID_END_HOUR * 60
  const hours = Array.from({ length: GRID_END_HOUR - GRID_START_HOUR }, (_, index) => GRID_START_HOUR + index)

  if (!room) {
    return <div className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Анги олдсонгүй</div>
  }

  const regularEvents = events.filter(event => event.roomId === room.id && !event.isOverride)
  const expandedEvents = regularEvents.flatMap(event =>
    event.daysOfWeek
      .filter(day => day >= 1 && day <= 5)
      .map(day => ({ event, day }))
  )

  return (
    <div className="rounded-md border border-[#d1d1d1] bg-white shadow-sm dark:border-border dark:bg-card">
      <div className="border-b border-[#e1dfdd] px-4 py-3 dark:border-border">
        <p className="text-sm font-semibold text-foreground">Долоо хоногийн хуваарь · {room.number}</p>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          <div className="grid grid-cols-[60px_repeat(5,1fr)] border-b border-[#e1dfdd] dark:border-border">
            <div className="p-2 text-xs text-muted-foreground" />
            {WORK_DAYS.map(day => (
              <div key={day.value} className="border-l border-[#e1dfdd] p-2 text-center text-sm font-medium dark:border-border">
                {day.label}
              </div>
            ))}
          </div>

          <div className="relative">
            {hours.map(hour => (
              <div key={hour} className="grid h-12 grid-cols-[60px_repeat(5,1fr)] border-b border-[#edebe9] dark:border-border">
                <div className="p-1 pr-2 pt-0 text-right text-xs text-muted-foreground -translate-y-2">
                  {`${String(hour).padStart(2, '0')}:00`}
                </div>
                {WORK_DAYS.map(day => (
                  <div key={day.value} className="border-l border-[#edebe9] dark:border-border" />
                ))}
              </div>
            ))}

            {expandedEvents.map(({ event, day }, index) => {
              const dayIndex = WORK_DAYS.findIndex(entry => entry.value === day)
              if (dayIndex === -1) return null

              const startMinutes = timeToMinutes(event.startTime)
              const endMinutes = timeToMinutes(event.endTime)
              const clippedStartMinutes = Math.max(startMinutes, gridStartMinutes)
              const clippedEndMinutes = Math.min(endMinutes, gridEndMinutes)
              if (!Number.isFinite(startMinutes) || !Number.isFinite(endMinutes) || clippedEndMinutes <= clippedStartMinutes) {
                return null
              }

              const startOffset = ((clippedStartMinutes - gridStartMinutes) / 60) * HOUR_HEIGHT
              const height = ((clippedEndMinutes - clippedStartMinutes) / 60) * HOUR_HEIGHT
              const width = 'calc((100% - 60px) / 5 - 4px)'

              return (
                <button
                  key={`${event.id}-${day}-${index}`}
                  type="button"
                  className={cn(
                    'absolute cursor-pointer overflow-hidden rounded-md border border-[#d1d1d1] border-l-4 p-1.5 text-left text-xs shadow-sm transition-opacity hover:opacity-90',
                    getEventTone(event.type),
                  )}
                  style={{
                    top: `${startOffset}px`,
                    height: `${height}px`,
                    left: `calc(60px + ${dayIndex} * ((100% - 60px) / 5) + 2px)`,
                    width,
                  }}
                  onClick={() => onEditEvent(event, day)}
                >
                  <div className="truncate font-medium">{event.title}</div>
                  <div className="truncate opacity-80">{event.startTime} - {event.endTime}</div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
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
