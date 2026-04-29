'use client'

import { Clock, Monitor } from 'lucide-react'

export function LoginSummaryCards() {
  return (
    <div className="grid grid-cols-2 gap-3 pt-4">
      <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-card/30 p-3">
        <Monitor className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">10 лаборатори</span>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-card/30 p-3">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Шууд хуваарь</span>
      </div>
    </div>
  )
}
