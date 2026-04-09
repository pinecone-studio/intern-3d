import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/status-badge'
import type { AuditLogEntry } from '@/lib/types'
import { actionLabels, roleLabels, triggerSourceLabels } from '@/lib/mock-configs'

type AuditTableProps = {
  logs: AuditLogEntry[]
  onViewDetails: (log: AuditLogEntry) => void
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('mn-MN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function AuditTable({ logs, onViewDetails }: AuditTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Огноо</TableHead>
          <TableHead>Ажилтны ID</TableHead>
          <TableHead>Ажилтан</TableHead>
          <TableHead>Үйлдэл</TableHead>
          <TableHead>Баримт</TableHead>
          <TableHead>Хүлээн авагч</TableHead>
          <TableHead>Эх сурвалж</TableHead>
          <TableHead>Давталт</TableHead>
          <TableHead>Төлөв</TableHead>
          <TableHead className="text-right">Дэлгэрэнгүй</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell className="font-mono text-xs">
              {formatDate(log.timestamp)}
            </TableCell>
            <TableCell className="font-mono text-xs">{log.employeeId}</TableCell>
            <TableCell>{log.employeeName}</TableCell>
            <TableCell>
              <Badge variant="outline">{actionLabels[log.action]}</Badge>
            </TableCell>
            <TableCell>{log.documentsCount}</TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                {log.recipientsNotified.slice(0, 2).map((role) => (
                  <Badge key={role} variant="secondary" className="text-xs">
                    {roleLabels[role]}
                  </Badge>
                ))}
                {log.recipientsNotified.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{log.recipientsNotified.length - 2}
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="capitalize">
                {triggerSourceLabels[log.triggerSource]}
              </Badge>
            </TableCell>
            <TableCell>{log.retryCount}</TableCell>
            <TableCell>
              <StatusBadge status={log.status} />
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3"
                onClick={() => onViewDetails(log)}
              >
                Нээх
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
