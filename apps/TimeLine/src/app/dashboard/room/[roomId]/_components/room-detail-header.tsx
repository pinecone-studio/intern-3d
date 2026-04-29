'use client'

import Link from 'next/link'
import { ArrowLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RoomStatusBadge } from '@/components/rooms/room-status-badge'
import type { Room } from '@/lib/types'

type RoomDetailHeaderProps = {
  isAdmin: boolean
  onCreateEvent: () => void
  room: Room
}

export function RoomDetailHeader({ isAdmin, onCreateEvent, room }: RoomDetailHeaderProps) {
  return (
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
          <p className="mt-1 text-sm text-muted-foreground">
            {room.floor}-р давхар • {room.type === 'lab' ? 'Компьютер лаб' : 'Үйл явдлын танхим'}
          </p>
        </div>
      </div>
      {isAdmin && (
        <Button onClick={onCreateEvent}>
          <Plus className="mr-2 h-4 w-4" />
          Хуваарь нэмэх
        </Button>
      )}
    </div>
  )
}
