import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/status-badge'
import type { AuditLogEntry } from '@/lib/types'
import { actionLabels } from '@/lib/mock-configs'

type ActivityFeedProps = {
  logs: AuditLogEntry[]
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ActivityFeed({ logs }: ActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-3">
            <div className="mt-1 size-2 rounded-full bg-primary" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{log.employeeName}</p>
                <StatusBadge status={log.status} />
              </div>
              <p className="text-xs text-muted-foreground">
                {actionLabels[log.action]} - {log.documentsCount} documents
              </p>
              <p className="text-xs text-muted-foreground">
                {formatTime(log.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
