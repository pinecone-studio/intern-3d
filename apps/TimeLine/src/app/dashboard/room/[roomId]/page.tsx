'use client'

import { use, useEffect, useState } from 'react'
import Link from 'next/link'
import { gql } from '@apollo/client'
import { useMutation, useQuery } from '@apollo/client/react'
import { useRole } from '@/lib/role-context'
import { DAYS_OF_WEEK, EVENT_TYPE_CONFIG, STATUS_CONFIG } from '@/lib/constants'
import type { ScheduleEvent, EventType, Room } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RoomStatusBadge } from '@/components/rooms/room-status-badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  Monitor, 
  Clock, 
  CalendarDays, 
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Info
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { format, parseISO } from 'date-fns'

// Demo time simulation: Tuesday 10:30
const DEMO_DAY = 2
const DEMO_TIME = '10:30'

const GET_ROOM_DETAIL = gql`
  query GetRoomDetail($roomId: ID!) {
    room(roomId: $roomId) {
      room {
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

type RoomDetailQueryResult = {
  room: {
    room: Room
    events: ScheduleEvent[]
  } | null
}

type EventFormData = {
  title: string
  type: EventType
  daysOfWeek: number[]
  startTime: string
  endTime: string
  instructor: string
  notes: string
  isOverride: boolean
  validFrom: string
  validUntil: string
  date: string
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

function createEventFormData(event: ScheduleEvent | null): EventFormData {
  return {
    title: event?.title || '',
    type: event?.type || 'class',
    daysOfWeek: event?.daysOfWeek || [1],
    startTime: event?.startTime || '09:00',
    endTime: event?.endTime || '12:00',
    instructor: event?.instructor || '',
    notes: event?.notes || '',
    isOverride: event?.isOverride || false,
    validFrom: event?.validFrom || '',
    validUntil: event?.validUntil || '',
    date: event?.date || '',
  }
}

function createMutationInput(roomId: string, formData: EventFormData): ScheduleEventMutationInput {
  return {
    roomId,
    title: formData.title.trim(),
    type: formData.type,
    startTime: formData.startTime,
    endTime: formData.endTime,
    daysOfWeek: formData.daysOfWeek,
    date: formData.date || null,
    isOverride: formData.isOverride,
    validFrom: formData.validFrom || null,
    validUntil: formData.validUntil || null,
  }
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

export default function RoomDetailPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params)
  const { role } = useRole()
  const isAdmin = role === 'admin'
  const { data, loading, error, refetch } = useQuery<RoomDetailQueryResult>(GET_ROOM_DETAIL, {
    variables: { roomId },
  })
  const [createScheduleEvent, { loading: creatingEvent }] = useMutation(CREATE_SCHEDULE_EVENT)
  const [updateScheduleEvent, { loading: updatingEvent }] = useMutation(UPDATE_SCHEDULE_EVENT)
  const [deleteScheduleEvent, { loading: deletingEvent }] = useMutation(DELETE_SCHEDULE_EVENT)
  const room = data?.room?.room
  const roomEvents = data?.room?.events ?? []
  
  const [selectedDay, setSelectedDay] = useState(DEMO_DAY)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<ScheduleEvent | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)
  const isSavingEvent = creatingEvent || updatingEvent

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
        <h1 className="text-xl font-bold">Өрөөний мэдээлэл ачаалж чадсангүй</h1>
        <p className="max-w-md text-sm text-muted-foreground">{error.message}</p>
        <Button onClick={() => refetch()}>Дахин оролдох</Button>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h1 className="text-xl font-bold">Өрөө олдсонгүй</h1>
        <Link href="/dashboard">
          <Button variant="link">Буцах</Button>
        </Link>
      </div>
    )
  }

  // Filter events for selected day - now checking daysOfWeek array
  const todayEvents = roomEvents
    .filter(e => e.daysOfWeek.includes(selectedDay))
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime))

  const regularEvents = roomEvents.filter(e => !e.isOverride)
  const overrideEvents = roomEvents.filter(e => e.isOverride)

  const handleCreateEvent = () => {
    setMutationError(null)
    setEditingEvent(null)
    setEditDialogOpen(true)
  }

  const handleEditEvent = (event: ScheduleEvent) => {
    setMutationError(null)
    setEditingEvent(event)
    setEditDialogOpen(true)
  }

  const handleDeleteEvent = (event: ScheduleEvent) => {
    setMutationError(null)
    setEventToDelete(event)
    setDeleteDialogOpen(true)
  }

  const handleSaveEvent = async (formData: EventFormData) => {
    try {
      setMutationError(null)
      const input = createMutationInput(roomId, formData)

      if (editingEvent) {
        await updateScheduleEvent({ variables: { id: editingEvent.id, input } })
      } else {
        await createScheduleEvent({ variables: { input } })
      }

      await refetch()
      setEditDialogOpen(false)
      setEditingEvent(null)
    } catch (saveError) {
      setMutationError(saveError instanceof Error ? saveError.message : 'Хуваарь хадгалж чадсангүй')
    }
  }

  const handleConfirmDelete = async () => {
    if (!eventToDelete) return

    try {
      setMutationError(null)
      await deleteScheduleEvent({ variables: { id: eventToDelete.id } })
      await refetch()
      setDeleteDialogOpen(false)
      setEventToDelete(null)
    } catch (deleteError) {
      setMutationError(deleteError instanceof Error ? deleteError.message : 'Хуваарь устгаж чадсангүй')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-foreground">{room.number}</h1>
              <RoomStatusBadge status={room.status} size="lg" />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {room.floor}-р давхар • {room.type === 'lab' ? 'Компьютер лаб' : 'Үйл явдлын танхим'}
            </p>
          </div>
        </div>
        {isAdmin && (
          <Button onClick={handleCreateEvent}>
            <Plus className="h-4 w-4 mr-2" />
            Хуваарь нэмэх
          </Button>
        )}
      </div>

      {/* Room Info Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Current Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Одоогийн төлөв</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={cn(
                'h-3 w-3 rounded-full',
                STATUS_CONFIG[room.status].dotColor,
                room.status === 'available' && 'animate-pulse'
              )} />
              <span className="text-lg font-semibold">{STATUS_CONFIG[room.status].label}</span>
            </div>
            {room.currentEvent && (
              <p className="text-xs text-muted-foreground mt-1">
                {room.currentEvent.title} ({room.currentEvent.startTime} - {room.currentEvent.endTime})
              </p>
            )}
          </CardContent>
        </Card>

        {/* Next Event */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Дараагийн үйл явдал</CardTitle>
          </CardHeader>
          <CardContent>
            {room.nextEvent ? (
              <>
                <span className="text-lg font-semibold">{room.nextEvent.title}</span>
                <p className="text-xs text-muted-foreground mt-1">
                  {room.nextEvent.startTime} - {room.nextEvent.endTime}
                </p>
              </>
            ) : (
              <span className="text-muted-foreground">Өнөөдөр дахиж хуваарь байхгүй</span>
            )}
          </CardContent>
        </Card>

        {/* Device Count */}
        {room.type === 'lab' && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Төхөөрөмжүүд</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-primary" />
                <span className="text-lg font-semibold">
                  {room.devices.filter(d => d.status === 'available').length}/{room.devices.length}
                </span>
                <span className="text-sm text-muted-foreground">iMac сул</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Demo Time Indicator */}
        <Card className="border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400">Демо цаг</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <span className="text-lg font-semibold text-amber-700 dark:text-amber-400">
                {DAYS_OF_WEEK.find(d => d.value === DEMO_DAY)?.label} {DEMO_TIME}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Tabs */}
      {mutationError && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {mutationError}
        </div>
      )}

      <Tabs defaultValue="today" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Өнөөдрийн хуваарь
          </TabsTrigger>
          <TabsTrigger value="weekly" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Долоо хоногийн хуваарь
          </TabsTrigger>
          <TabsTrigger value="overrides" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Түр өөрчлөлтүүд
            {overrideEvents.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {overrideEvents.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Today's Schedule */}
        <TabsContent value="today" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Өнөөдрийн хуваарь</CardTitle>
                  <CardDescription>
                    {DAYS_OF_WEEK.find(d => d.value === selectedDay)?.label} гаригийн хуваарь
                  </CardDescription>
                </div>
                <Select value={String(selectedDay)} onValueChange={(v) => setSelectedDay(Number(v))}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.filter(d => d.value >= 1 && d.value <= 5).map(day => (
                      <SelectItem key={day.value} value={String(day.value)}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {todayEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Энэ өдөр хуваарь байхгүй байна</p>
                  {isAdmin && (
                    <Button variant="outline" size="sm" className="mt-4" onClick={handleCreateEvent}>
                      <Plus className="h-4 w-4 mr-2" />
                      Хуваарь нэмэх
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {todayEvents.map(event => {
                    const config = EVENT_TYPE_CONFIG[event.type]
                    const isCurrentTime = selectedDay === DEMO_DAY && 
                      timeToMinutes(DEMO_TIME) >= timeToMinutes(event.startTime) && 
                      timeToMinutes(DEMO_TIME) < timeToMinutes(event.endTime)
                    
                    return (
                      <div
                        key={event.id}
                        className={cn(
                          'relative flex items-center gap-4 rounded-lg border p-4 transition-colors',
                          isCurrentTime && 'ring-2 ring-primary bg-primary/5',
                          event.isOverride && 'border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5'
                        )}
                      >
                        <div className={cn(
                          'h-full w-1 rounded-full absolute left-0 top-0 bottom-0',
                          config.bgColor
                        )} />
                        <div className="flex-1 ml-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{event.title}</span>
                            {event.isOverride && (
                              <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-500/30">
                                Түр өөрчлөлт
                              </Badge>
                            )}
                            {isCurrentTime && (
                              <Badge className="bg-primary">Одоо</Badge>
                            )}
                            {/* Show validity period if exists */}
                            {event.validFrom && event.validUntil && (
                              <Badge variant="secondary" className="text-xs">
                                {format(parseISO(event.validFrom), 'MM/dd')} - {format(parseISO(event.validUntil), 'MM/dd')}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {event.startTime} - {event.endTime}
                            {event.instructor && ` • ${event.instructor}`}
                          </p>
                          {/* Show which days this event repeats */}
                          {event.daysOfWeek.length > 1 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Давтагдах: {event.daysOfWeek.map(d => DAYS_OF_WEEK.find(day => day.value === d)?.short).join(', ')}
                            </p>
                          )}
                          {event.notes && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Info className="h-3 w-3" />
                              {event.notes}
                            </p>
                          )}
                        </div>
                        <Badge variant="secondary" className={cn(
                          'shrink-0',
                          event.type === 'class' && 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
                          event.type === 'club' && 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400',
                          event.type === 'openlab' && 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
                          event.type === 'closed' && 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400',
                        )}>
                          {config.label}
                        </Badge>
                        {isAdmin && (
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditEvent(event)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteEvent(event)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Weekly Schedule Grid */}
        <TabsContent value="weekly" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Долоо хоногийн хуваарь</CardTitle>
              <CardDescription>Даваа - Баасан гариг</CardDescription>
            </CardHeader>
            <CardContent>
              <WeeklyScheduleGrid events={regularEvents} isAdmin={isAdmin} onEditEvent={handleEditEvent} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overrides */}
        <TabsContent value="overrides" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Түр өөрчлөлтүүд
                  </CardTitle>
                  <CardDescription>
                    Энгийн хуваариас өөрчлөгдсөн үйл явдлууд
                  </CardDescription>
                </div>
                {isAdmin && (
                  <Button variant="outline" onClick={handleCreateEvent}>
                    <Plus className="h-4 w-4 mr-2" />
                    Түр өөрчлөлт нэмэх
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {overrideEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Түр өөрчлөлт байхгүй байна</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {overrideEvents.map(event => {
                    const config = EVENT_TYPE_CONFIG[event.type]
                    const dayNames = event.daysOfWeek.map(d => DAYS_OF_WEEK.find(day => day.value === d)?.label).join(', ')
                    
                    return (
                      <div
                        key={event.id}
                        className="flex items-center gap-4 rounded-lg border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5 p-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{event.title}</span>
                            <Badge variant="secondary" className={cn(
                              event.type === 'closed' && 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400',
                            )}>
                              {config.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {dayNames} • {event.startTime} - {event.endTime}
                            {event.date && ` • ${event.date}`}
                          </p>
                          {event.notes && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <Info className="h-3 w-3" />
                              {event.notes}
                            </p>
                          )}
                        </div>
                        {isAdmin && (
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditEvent(event)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteEvent(event)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit/Create Event Dialog */}
      <EventFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        event={editingEvent}
        roomId={roomId}
        onSave={handleSaveEvent}
        saving={isSavingEvent}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Устгахыг баталгаажуулах</DialogTitle>
            <DialogDescription>
              Та &quot;{eventToDelete?.title}&quot; үйл явдлыг устгахдаа итгэлтэй байна уу?
              Энэ үйлдлийг буцаах боломжгүй.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Болих
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={deletingEvent}>
              {deletingEvent ? 'Устгаж байна...' : 'Устгах'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Weekly Schedule Grid Component
function WeeklyScheduleGrid({ 
  events, 
  isAdmin, 
  onEditEvent 
}: { 
  events: ScheduleEvent[]
  isAdmin: boolean
  onEditEvent: (_event: ScheduleEvent) => void
}) {
  const days = DAYS_OF_WEEK.filter(d => d.value >= 1 && d.value <= 5)
  const hours = Array.from({ length: 12 }, (_, i) => 8 + i) // 8:00 - 19:00

  // Expand events to show on each of their days
  const expandedEvents = events.flatMap(event => 
    event.daysOfWeek
      .filter(d => d >= 1 && d <= 5)
      .map(day => ({ ...event, displayDay: day }))
  )

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[700px]">
        {/* Header */}
        <div className="grid grid-cols-[60px_repeat(5,1fr)] border-b">
          <div className="p-2 text-xs text-muted-foreground" />
          {days.map(day => (
            <div 
              key={day.value} 
              className={cn(
                'p-2 text-center text-sm font-medium border-l',
                day.value === DEMO_DAY && 'bg-primary/10 text-primary'
              )}
            >
              {day.label}
            </div>
          ))}
        </div>

        {/* Time rows */}
        <div className="relative">
          {hours.map(hour => (
            <div key={hour} className="grid grid-cols-[60px_repeat(5,1fr)] border-b h-12">
              <div className="p-1 text-xs text-muted-foreground text-right pr-2 pt-0 -translate-y-2">
                {`${String(hour).padStart(2, '0')}:00`}
              </div>
              {days.map(day => (
                <div key={day.value} className="border-l relative" />
              ))}
            </div>
          ))}

          {/* Events overlay */}
          {expandedEvents.map((event, idx) => {
            const dayIndex = days.findIndex(d => d.value === event.displayDay)
            if (dayIndex === -1) return null

            const startMinutes = timeToMinutes(event.startTime)
            const endMinutes = timeToMinutes(event.endTime)
            const startOffset = (startMinutes - 8 * 60) / 60 * 48 // 48px per hour
            const height = (endMinutes - startMinutes) / 60 * 48
            const width = `calc((100% - 60px) / 5 - 4px)`

            const config = EVENT_TYPE_CONFIG[event.type]

            return (
              <div
                key={`${event.id}-${event.displayDay}-${idx}`}
                className={cn(
                  'absolute rounded-md text-white text-xs p-1.5 overflow-hidden cursor-pointer transition-opacity hover:opacity-90',
                  config.bgColor
                )}
                style={{
                  top: `${startOffset}px`,
                  height: `${height}px`,
                  left: `calc(60px + ${dayIndex} * ((100% - 60px) / 5) + 2px)`,
                  width,
                }}
                onClick={() => isAdmin && onEditEvent(event)}
              >
                <div className="font-medium truncate">{event.title}</div>
                <div className="opacity-80 truncate">
                  {event.startTime} - {event.endTime}
                </div>
              </div>
            )
          })}

          {/* Current time indicator */}
          {(() => {
            const currentMinutes = timeToMinutes(DEMO_TIME)
            const offset = (currentMinutes - 8 * 60) / 60 * 48
            const dayIndex = days.findIndex(d => d.value === DEMO_DAY)
            if (dayIndex === -1 || offset < 0 || offset > 12 * 48) return null

            return (
              <div
                className="absolute left-[60px] right-0 h-0.5 bg-destructive z-10 pointer-events-none"
                style={{ top: `${offset}px` }}
              >
                <div className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full bg-destructive" />
              </div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}

// Event Form Dialog Component - Updated with multi-day selection and date range
function EventFormDialog({
  open,
  onOpenChange,
  event,
  roomId: _roomId,
  onSave,
  saving,
}: {
  open: boolean
  onOpenChange: (_open: boolean) => void
  event: ScheduleEvent | null
  roomId: string
  onSave: (_formData: EventFormData) => void
  saving: boolean
}) {
  const isEditing = !!event
  const [formData, setFormData] = useState<EventFormData>(() => createEventFormData(event))

  useEffect(() => {
    if (open) {
      setFormData(createEventFormData(event))
    }
  }, [event, open])

  const weekdays = DAYS_OF_WEEK.filter(d => d.value >= 1 && d.value <= 5)

  const toggleDay = (dayValue: number) => {
    setFormData(prev => {
      const newDays = prev.daysOfWeek.includes(dayValue)
        ? prev.daysOfWeek.filter(d => d !== dayValue)
        : [...prev.daysOfWeek, dayValue].sort((a, b) => a - b)
      // Ensure at least one day is selected
      return { ...prev, daysOfWeek: newDays.length > 0 ? newDays : prev.daysOfWeek }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Хуваарь засах' : 'Шинэ хуваарь нэмэх'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Үйл явдлын мэдээллийг өөрчилнө үү' : 'Шинэ үйл явдал үүсгэх'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Нэр</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Веб хөгжүүлэлт"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="type">Төрөл</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as EventType }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="class">Хичээл</SelectItem>
                <SelectItem value="club">Клуб</SelectItem>
                <SelectItem value="openlab">Нээлттэй (Open Lab)</SelectItem>
                <SelectItem value="closed">Хаалттай</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Multi-day selection with toggle chips */}
          <div className="grid gap-2">
            <Label>Гаригууд</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Олон гариг сонгож болно. Жишээ нь: Даваа, Лхагва, Баасан
            </p>
            <div className="flex flex-wrap gap-2">
              {weekdays.map(day => {
                const isSelected = formData.daysOfWeek.includes(day.value)
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium transition-all border',
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {day.short}
                  </button>
                )
              })}
            </div>
            {formData.daysOfWeek.length > 0 && (
              <p className="text-xs text-primary mt-1">
                Сонгосон: {formData.daysOfWeek.map(d => DAYS_OF_WEEK.find(day => day.value === d)?.label).join(', ')}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startTime">Эхлэх цаг</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endTime">Дуусах цаг</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
              />
            </div>
          </div>

          {/* Validity period for recurring schedules */}
          {!formData.isOverride && (
            <div className="rounded-lg border p-4 space-y-4">
              <div>
                <Label className="text-sm font-medium">Хүчинтэй хугацаа</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Долоо хоног бүр давтагдах хуваарийн хүчинтэй хугацаа
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="validFrom" className="text-xs">Эхлэх огноо</Label>
                  <Input
                    id="validFrom"
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="validUntil" className="text-xs">Дуусах огноо</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                  />
                </div>
              </div>
              {formData.validFrom && formData.validUntil && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {formData.validFrom}-ээс {formData.validUntil} хүртэл хүчинтэй
                </p>
              )}
            </div>
          )}

          {formData.type === 'class' && (
            <div className="grid gap-2">
              <Label htmlFor="instructor">Багш</Label>
              <Input
                id="instructor"
                value={formData.instructor}
                onChange={(e) => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
                placeholder="Б. Болд"
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="notes">Тэмдэглэл</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Нэмэлт мэдээлэл..."
              rows={2}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="isOverride" className="font-medium">Түр өөрчлөлт</Label>
              <p className="text-xs text-muted-foreground">
                Тодорхой огноонд нэг удаагийн өөрчлөлт
              </p>
            </div>
            <Switch
              id="isOverride"
              checked={formData.isOverride}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isOverride: checked }))}
            />
          </div>

          {/* Date picker for override */}
          {formData.isOverride && (
            <div className="grid gap-2">
              <Label htmlFor="date">Огноо (түр өөрчлөлтөнд)</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Болих
          </Button>
          <Button onClick={() => onSave(formData)} disabled={saving || formData.daysOfWeek.length === 0 || formData.title.trim().length === 0}>
            {saving ? 'Хадгалж байна...' : isEditing ? 'Хадгалах' : 'Үүсгэх'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
