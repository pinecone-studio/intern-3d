import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/status-badge'
import type { AuditLogEntry } from '@/lib/types'
import {
  actionLabels,
  fieldLabels,
  roleLabels,
  triggerSourceLabels,
} from '@/lib/mock-configs'
import { Button } from '@/components/ui/button'

type AuditDetailDrawerProps = {
  log: AuditLogEntry | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('mn-MN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      <div>{children}</div>
    </div>
  )
}

export function AuditDetailDrawer({ log, open, onOpenChange }: AuditDetailDrawerProps) {
  if (!log || !open) return null

  return (
    <div className="fixed inset-0 z-50 flex bg-black/50" onClick={() => onOpenChange(false)}>
      <div
        className="ml-auto h-full w-full max-w-lg overflow-y-auto border-l border-border bg-card p-6 text-card-foreground shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Аудитын дэлгэрэнгүй</h2>
            <p className="text-sm text-muted-foreground">
              {log.employeeName}-ийн үйл явдлын бүрэн мэдээлэл
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Хаах
          </Button>
        </div>
        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm">{log.id}</span>
            <StatusBadge status={log.status} />
          </div>
          <div className="border-t border-border" />
          <DetailSection title="Огноо">
            <p className="text-sm">{formatDate(log.timestamp)}</p>
          </DetailSection>
          <DetailSection title="Ажилтан">
            <p className="text-sm">{log.employeeName}</p>
            <p className="text-xs text-muted-foreground font-mono">{log.employeeId}</p>
          </DetailSection>
          <DetailSection title="Үйлдэл">
            <Badge variant="outline">{actionLabels[log.action]}</Badge>
          </DetailSection>
          <DetailSection title="Өөрчлөгдсөн талбарууд">
            <div className="flex flex-wrap gap-1">
              {log.changedFields.map((field) => (
                <Badge key={field} variant="secondary">
                  {fieldLabels[field] ?? field}
                </Badge>
              ))}
            </div>
          </DetailSection>
          <DetailSection title="Мэдэгдэл авсан хүмүүс">
            <div className="flex flex-wrap gap-1">
              {log.recipientsNotified.map((role) => (
                <Badge key={role} variant="secondary">{roleLabels[role]}</Badge>
              ))}
            </div>
          </DetailSection>
          <DetailSection title="Хадгалалтын зам">
            <div className="space-y-1">
              {log.storagePaths.map((path) => (
                <p key={path} className="text-xs font-mono bg-secondary p-2 rounded">{path}</p>
              ))}
            </div>
          </DetailSection>
          <DetailSection title="Эх сурвалж">
            <Badge variant="outline" className="capitalize">
              {triggerSourceLabels[log.triggerSource]}
            </Badge>
          </DetailSection>
          <DetailSection title="Давталтын тоо">
            <p className="text-sm">{log.retryCount}</p>
          </DetailSection>
          {log.failureReason && (
            <DetailSection title="Алдааны шалтгаан">
              <p className="text-sm text-destructive">{log.failureReason}</p>
            </DetailSection>
          )}
        </div>
      </div>
    </div>
  )
}
