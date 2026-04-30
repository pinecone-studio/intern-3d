import { Card } from '@/components/ui/card'
import type { Room } from '@/lib/types'
import { Building2, DoorOpen, BookOpen, Users, CalendarRange } from 'lucide-react'

interface RoomStatsCardsProps {
  rooms: Room[]
}

export function RoomStatsCards({ rooms }: RoomStatsCardsProps) {
  const stats = {
    total: rooms.length,
    openlab: rooms.filter(r => r.status === 'open_lab').length,
    inClass: rooms.filter(r => r.status === 'class').length,
    inClub: rooms.filter(r => r.status === 'club').length,
    inEvent: rooms.filter(r => r.status === 'event').length,
  }

  const statItems = [
    { label: 'Нийт өрөө', value: stats.total, icon: Building2 },
    { label: 'Open Lab', value: stats.openlab, icon: DoorOpen },
    { label: 'Хичээлтэй', value: stats.inClass, icon: BookOpen },
    { label: 'Клубтэй', value: stats.inClub, icon: Users },
    { label: 'Eventтэй', value: stats.inEvent, icon: CalendarRange },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {statItems.map((item) => (
        <Card key={item.label} className="rounded-md border-border p-4 shadow-none">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
              <item.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
