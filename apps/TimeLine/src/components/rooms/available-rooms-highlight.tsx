'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RoomCard } from './room-card'
import type { Room } from '@/lib/types'
import { Sparkles } from 'lucide-react'

interface AvailableRoomsHighlightProps {
  rooms: Room[]
}

export function AvailableRoomsHighlight({ rooms }: AvailableRoomsHighlightProps) {
  const availableRooms = rooms.filter(room => room.status === 'open_lab')

  if (availableRooms.length === 0) {
    return (
      <Card className="rounded-md border-border bg-card shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            яг одоо сул ангиуд
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Одоогоор бүх анги завгүй байна. Удалгүй сулрах ангиудыг доор харна уу.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-md border-border bg-card shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Sparkles className="h-4 w-4 text-muted-foreground" />
          <span>яг одоо сул ангиуд</span>
          <span className="ml-auto rounded-md border border-border px-2 py-0.5 text-sm font-medium text-muted-foreground">
            {availableRooms.length}
          </span>
        </CardTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          Эдгээр ангиуд одоо Open Lab төлөвтэй байна
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {availableRooms.map(room => (
            <RoomCard key={room.id} room={room} compact />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
