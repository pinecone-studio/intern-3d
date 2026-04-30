'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { RoomStatusBadge } from './room-status-badge'
import type { Room } from '@/lib/types'
import { Monitor, Clock, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EVENT_TYPE_CONFIG } from '@/lib/constants'

interface RoomCardProps {
  room: Room
  compact?: boolean
}

export function RoomCard({ room, compact }: RoomCardProps) {
  const isAvailable = room.status === 'available'
  const availableDeviceCount = room.devices.filter(d => d.status === 'available').length

  const cardContent = compact ? (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <RoomStatusBadge status={room.status} size="sm" />
        <div>
          <span className="font-semibold text-foreground">{room.number}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {room.devices.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {availableDeviceCount}/{room.devices.length} сул
          </span>
        )}
        <span className="timeline-room-card-hover flex items-center justify-center">
          <ArrowRight className="h-5 w-5 text-foreground" />
        </span>
      </div>
    </div>
  ) : (
    <>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <RoomStatusBadge status={room.status} size="md" />
          </div>
          <div className="text-right">
            <h3 className="text-xl font-semibold text-foreground">{room.number}</h3>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        {room.currentEvent ? (
          <div className={cn(
            'rounded-md border p-3',
            EVENT_TYPE_CONFIG[room.currentEvent.type]?.borderColor || 'border-border'
          )}>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Одоо</span>
            </div>
            <p className="mt-1 font-medium text-foreground">
              {room.currentEvent.title}
            </p>
            <p className="text-xs text-muted-foreground">
              {room.currentEvent.startTime} - {room.currentEvent.endTime}
              {room.currentEvent.instructor && ` • ${room.currentEvent.instructor}`}
            </p>
          </div>
        ) : (
          <div className="rounded-md border border-border bg-muted p-3">
            <p className="text-sm font-medium text-foreground">
              Одоо сул байна
            </p>
          </div>
        )}

        {room.nextEvent && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ArrowRight className="h-3 w-3" />
            <span>
              Дараа нь: {room.nextEvent.title} ({room.nextEvent.startTime})
            </span>
          </div>
        )}

        {!room.nextEvent && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ArrowRight className="h-3 w-3" />
            <span>Дараагийн хуваарь байхгүй</span>
          </div>
        )}

        <div className="flex flex-col gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Monitor className="h-3 w-3" />
            <span>
              {availableDeviceCount}/{room.devices.length} iMac сул байна
            </span>
          </div>
        </div>

        <div className="mt-auto flex justify-end pt-2">
          <span className="timeline-room-card-hover flex items-center justify-center">
            <ArrowRight className="h-5 w-5 text-foreground" />
          </span>
        </div>
      </CardContent>
    </>
  )

  return (
    <Link href={`/dashboard/room/${room.id}`} className="block h-full">
      <Card
        className={cn(
          'timeline-room-card flex h-full cursor-pointer flex-col overflow-hidden rounded-md border border-border transition-colors hover:bg-muted/30',
          isAvailable && 'bg-muted/30',
          room.status === 'closed' && 'bg-muted/20',
          compact && 'p-3'
        )}
      >
        {cardContent}
      </Card>
    </Link>
  )
}
