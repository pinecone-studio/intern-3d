import { Card } from '@/components/ui/card'
import type { Device } from '@/lib/types'
import { Monitor } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DeviceCardProps {
  device: Device
  isUserDevice?: boolean
}

export function DeviceCard({ device, isUserDevice }: DeviceCardProps) {
  const statusLabels = {
    available: 'Сул',
    assigned: isUserDevice ? 'Танд хуваарилагдсан' : 'Хуваарилагдсан',
    maintenance: 'Засвартай',
  }

  return (
    <Card 
      className={cn(
        'rounded-md border-border p-3 shadow-none',
        isUserDevice && 'bg-muted'
      )}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          'flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background text-muted-foreground'
        )}>
          <Monitor className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-foreground truncate">
              {device.name}
            </h4>
            {isUserDevice && (
              <span className="shrink-0 rounded-md border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                Таных
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Анги: {device.roomNumber}
          </p>
          <div className="mt-1 flex items-center gap-1.5">
            <span className={cn(
              'h-1.5 w-1.5 rounded-full',
              device.status === 'available' ? 'bg-foreground' :
              device.status === 'assigned' ? 'bg-muted-foreground' : 'bg-border'
            )} />
            <span className="text-xs text-muted-foreground">
              {statusLabels[device.status]}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
