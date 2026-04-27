'use client'

import { useState, useMemo } from 'react'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { useRole } from '@/lib/role-context'
import { DAYS_OF_WEEK, EVENT_TYPE_CONFIG } from '@/lib/constants'
import { useTimelineClock } from '@/lib/use-timeline-clock'
import { useTimelineLiveUpdates } from '@/lib/use-timeline-live-updates'
import type { Room, ScheduleEvent } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CalendarDays, 
  Clock, 
  MapPin,
  Calendar,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, addDays, startOfWeek, parseISO, startOfMonth, endOfMonth } from 'date-fns'
import { mn } from 'date-fns/locale'
import Link from 'next/link'

type FilterType = 'today' | 'week' | 'month'

const GET_MY_SCHEDULE = gql`
  query GetMySchedule {
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
    rooms {
      id
      number
    }
  }
`

type MyScheduleQueryResult = {
  events: ScheduleEvent[]
  rooms: Array<Pick<Room, 'id' | 'number'>>
}

function getInstructorSearchName(userName?: string): string {
  const lastName = userName?.split(' ').pop()
  return lastName && lastName !== 'Admin' ? lastName : 'Болд'
}

function getInstructorEvents(events: ScheduleEvent[], instructorName: string): ScheduleEvent[] {
  const instructorEvents = events.filter(event => event.instructor?.includes(instructorName))
  return instructorEvents.length > 0 ? instructorEvents : events
}

export default function MySchedulePage() {
  const { user, role } = useRole()
  const clock = useTimelineClock()
  const [filter, setFilter] = useState<FilterType>('today')

  // Get the instructor name from the user
  const instructorName = getInstructorSearchName(user?.name)
  const { data, loading, error, refetch } = useQuery<MyScheduleQueryResult>(GET_MY_SCHEDULE, {
    skip: role !== 'admin',
  })

  useTimelineLiveUpdates({
    enabled: role === 'admin' && !loading,
    onEventsChanged: () => refetch(),
  })

  const myEvents = useMemo(() => {
    return getInstructorEvents(data?.events ?? [], instructorName)
  }, [data?.events, instructorName])
  const roomNamesById = useMemo(() => {
    return new Map((data?.rooms ?? []).map(room => [room.id, room.number]))
  }, [data?.rooms])
  const now = clock?.now ?? null

  // Get date range based on filter
  const dateRange = useMemo(() => {
    if (!now) {
      return { start: null, end: null, label: 'Өнөөдөр' }
    }

    switch (filter) {
      case 'today': {
        return { start: now, end: now, label: 'Өнөөдөр' }
      }
      case 'week': {
        const start = startOfWeek(now, { weekStartsOn: 1 })
        const end = addDays(start, 6)
        return { start, end, label: '7 хоног' }
      }
      case 'month': {
        const start = startOfMonth(now)
        const end = endOfMonth(now)
        return { start, end, label: 'Сар' }
      }
    }
  }, [filter, now])

  // Filter events based on the selected date range and day of week
  const filteredEvents = useMemo(() => {
    const currentDayOfWeek = clock?.currentDay ?? null
    if (currentDayOfWeek === null) {
      return []
    }
    
    switch (filter) {
      case 'today': {
        return myEvents.filter(event => event.daysOfWeek.includes(currentDayOfWeek))
      }
      case 'week': {
        return myEvents.filter(event => {
          return event.daysOfWeek.some(d => d >= 1 && d <= 5)
        })
      }
      case 'month': {
        return myEvents
      }
    }
  }, [clock?.currentDay, filter, myEvents])

  // Group events by day for display
  const eventsByDay = useMemo(() => {
    const grouped: Record<number, ScheduleEvent[]> = {}
    
    filteredEvents.forEach(event => {
      event.daysOfWeek.forEach(day => {
        if (!grouped[day]) grouped[day] = []
        // Avoid duplicates
        if (!grouped[day].find(e => e.id === event.id)) {
          grouped[day].push(event)
        }
      })
    })

    // Sort events within each day by start time
    Object.keys(grouped).forEach(day => {
      grouped[Number(day)].sort((a, b) => {
        const aMinutes = parseInt(a.startTime.split(':')[0]) * 60 + parseInt(a.startTime.split(':')[1])
        const bMinutes = parseInt(b.startTime.split(':')[0]) * 60 + parseInt(b.startTime.split(':')[1])
        return aMinutes - bMinutes
      })
    })

    return grouped
  }, [filteredEvents])

  // Get room name from room ID
  const getRoomName = (roomId: string) => {
    return roomNamesById.get(roomId) || roomId
  }

  const isCurrentEvent = (event: ScheduleEvent) => {
    if (!clock || !event.daysOfWeek.includes(clock.currentDay)) return false
    
    const startMinutes = parseInt(event.startTime.split(':')[0]) * 60 + parseInt(event.startTime.split(':')[1])
    const endMinutes = parseInt(event.endTime.split(':')[0]) * 60 + parseInt(event.endTime.split(':')[1])
    
    return clock.currentMinutes >= startMinutes && clock.currentMinutes < endMinutes
  }

  const isUpcoming = (event: ScheduleEvent) => {
    if (!clock || !event.daysOfWeek.includes(clock.currentDay)) return false
    
    const startMinutes = parseInt(event.startTime.split(':')[0]) * 60 + parseInt(event.startTime.split(':')[1])
    
    return startMinutes > clock.currentMinutes
  }

  const getValidityLabel = (event: ScheduleEvent) => {
    if (!event.validFrom || !event.validUntil || !now) return null
    
    const validFrom = parseISO(event.validFrom)
    const validUntil = parseISO(event.validUntil)
    
    const isExpired = now > validUntil
    const isUpcoming = now < validFrom
    if (isExpired) {
      return { label: 'Дууссан', className: 'bg-gray-100 dark:bg-gray-500/20 text-gray-600 dark:text-gray-400' }
    }
    if (isUpcoming) {
      return { label: 'Удахгүй', className: 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400' }
    }
    return null
  }

  if (role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <CalendarDays className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h1 className="text-xl font-semibold text-foreground mb-2">Зөвхөн багш нарт</h1>
        <p className="text-muted-foreground">Энэ хэсэг нь зөвхөн багш нарын хуваарийг харуулдаг.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!clock || !now || !dateRange.start || !dateRange.end) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
        <h1 className="text-xl font-bold">Миний хуваарийг ачаалж чадсангүй</h1>
        <p className="max-w-md text-sm text-muted-foreground">{error.message}</p>
        <Button type="button" variant="outline" onClick={() => refetch()}>
          Дахин оролдох
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Миний хуваарь</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Таны заадаг хичээлүүдийн хуваарь
          </p>
        </div>
        
        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
          <TabsList>
            <TabsTrigger value="today" className="gap-2">
              <Clock className="h-4 w-4" />
              Өнөөдөр
            </TabsTrigger>
            <TabsTrigger value="week" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              7 хоног
            </TabsTrigger>
            <TabsTrigger value="month" className="gap-2">
              <Calendar className="h-4 w-4" />
              Сар
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Current Date Indicator */}
      <Card className="border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/5">
        <CardContent className="py-3 flex items-center gap-3">
          <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <div>
            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
              Одоо: {format(now, 'yyyy оны MM сарын dd', { locale: mn })} {format(now, 'HH:mm')}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Schedule List */}
      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarDays className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="text-lg font-medium text-foreground mb-2">Хуваарь байхгүй</h2>
            <p className="text-sm text-muted-foreground">
              Таны {dateRange.label.toLowerCase()}-ийн хуваарь хоосон байна.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* For "today" filter, show a simple list */}
          {filter === 'today' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>{format(now, 'EEEE', { locale: mn })}</span>
                  <Badge variant="secondary" className="font-normal">
                    {filteredEvents.length} хичээл
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {format(now, 'yyyy оны MM сарын dd', { locale: mn })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredEvents
                  .sort((a, b) => {
                    const aMinutes = parseInt(a.startTime.split(':')[0]) * 60 + parseInt(a.startTime.split(':')[1])
                    const bMinutes = parseInt(b.startTime.split(':')[0]) * 60 + parseInt(b.startTime.split(':')[1])
                    return aMinutes - bMinutes
                  })
                  .map(event => (
                    <ScheduleEventCard
                      key={event.id}
                      event={event}
                      roomName={getRoomName(event.roomId)}
                      isCurrent={isCurrentEvent(event)}
                      isUpcoming={isUpcoming(event)}
                      validityLabel={getValidityLabel(event)}
                    />
                  ))
                }
              </CardContent>
            </Card>
          )}

          {/* For "week" filter, group by day */}
          {filter === 'week' && (
            <>
              {DAYS_OF_WEEK.filter(d => d.value >= 1 && d.value <= 5).map(day => {
                const dayEvents = eventsByDay[day.value] || []
                if (dayEvents.length === 0) return null
                
                const isToday = day.value === clock.currentDay
                
                return (
                  <Card key={day.value} className={cn(isToday && 'ring-2 ring-primary')}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <span>{day.label}</span>
                        {isToday && (
                          <Badge className="bg-primary">Өнөөдөр</Badge>
                        )}
                        <Badge variant="secondary" className="font-normal ml-auto">
                          {dayEvents.length} хичээл
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {dayEvents.map(event => (
                        <ScheduleEventCard
                          key={`${event.id}-${day.value}`}
                          event={event}
                          roomName={getRoomName(event.roomId)}
                          isCurrent={isToday && isCurrentEvent(event)}
                          isUpcoming={isToday && isUpcoming(event)}
                          validityLabel={getValidityLabel(event)}
                        />
                      ))}
                    </CardContent>
                  </Card>
                )
              })}
            </>
          )}

          {/* For "month" filter, show all with day indicators */}
          {filter === 'month' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>{format(now, 'yyyy оны MM сар', { locale: mn })}</span>
                  <Badge variant="secondary" className="font-normal">
                    {myEvents.length} хичээл
                  </Badge>
                </CardTitle>
                <CardDescription>
                  Бүх 7 хоногийн давтагдах хуваарь
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {myEvents
                  .sort((a, b) => {
                    // Sort by first day of week, then by start time
                    const dayDiff = a.daysOfWeek[0] - b.daysOfWeek[0]
                    if (dayDiff !== 0) return dayDiff
                    const aMinutes = parseInt(a.startTime.split(':')[0]) * 60 + parseInt(a.startTime.split(':')[1])
                    const bMinutes = parseInt(b.startTime.split(':')[0]) * 60 + parseInt(b.startTime.split(':')[1])
                    return aMinutes - bMinutes
                  })
                  .map(event => (
                    <ScheduleEventCard
                      key={event.id}
                      event={event}
                      roomName={getRoomName(event.roomId)}
                      isCurrent={isCurrentEvent(event)}
                      isUpcoming={isUpcoming(event)}
                      validityLabel={getValidityLabel(event)}
                      showDays
                    />
                  ))
                }
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

// Individual schedule event card component
function ScheduleEventCard({
  event,
  roomName,
  isCurrent,
  isUpcoming,
  validityLabel,
  showDays = false,
}: {
  event: ScheduleEvent
  roomName: string
  isCurrent: boolean
  isUpcoming: boolean
  validityLabel: { label: string; className: string } | null
  showDays?: boolean
}) {
  const config = EVENT_TYPE_CONFIG[event.type]
  
  // Get day names for multi-day display
  const dayNames = event.daysOfWeek
    .map(d => DAYS_OF_WEEK.find(day => day.value === d)?.short)
    .filter(Boolean)
    .join(', ')

  return (
    <Link href={`/dashboard/room/${event.roomId}`}>
      <div
        className={cn(
          'group relative flex items-center gap-4 rounded-lg border p-4 transition-all hover:shadow-md hover:border-primary/30',
          isCurrent && 'ring-2 ring-primary bg-primary/5 border-primary/30',
          isUpcoming && !isCurrent && 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-500/5'
        )}
      >
        {/* Left color bar */}
        <div className={cn(
          'absolute left-0 top-0 bottom-0 w-1 rounded-l-lg',
          config.bgColor
        )} />
        
        {/* Time */}
        <div className="text-center min-w-[70px] pl-2">
          <div className="text-lg font-semibold text-foreground">{event.startTime}</div>
          <div className="text-xs text-muted-foreground">{event.endTime}</div>
        </div>
        
        {/* Divider */}
        <div className="h-10 w-px bg-border" />
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-foreground truncate">{event.title}</span>
            {isCurrent && (
              <Badge className="bg-primary shrink-0">Одоо</Badge>
            )}
            {isUpcoming && !isCurrent && (
              <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30 shrink-0">
                Удахгүй
              </Badge>
            )}
            {validityLabel && (
              <Badge variant="secondary" className={cn('shrink-0', validityLabel.className)}>
                {validityLabel.label}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {roomName}
            </span>
            {showDays && (
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {dayNames}
              </span>
            )}
            {event.validFrom && event.validUntil && (
              <span className="text-xs">
                {format(parseISO(event.validFrom), 'MM/dd')} - {format(parseISO(event.validUntil), 'MM/dd')}
              </span>
            )}
          </div>
        </div>
        
        {/* Type badge */}
        <Badge variant="secondary" className={cn(
          'shrink-0',
          event.type === 'class' && 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
          event.type === 'club' && 'bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-400',
        )}>
          {config.label}
        </Badge>
        
        {/* Arrow */}
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
    </Link>
  )
}
