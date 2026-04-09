'use client'

import { useState } from 'react'
import { AppHeader } from '@/components/app-header'
import { Card, CardContent } from '@/components/ui/card'
import { AuditTable } from '@/components/audit/audit-table'
import { AuditDetailDrawer } from '@/components/audit/audit-detail-drawer'
import { mockAuditLogs } from '@/lib/mock-data'
import type { AuditLogEntry } from '@/lib/types'

export default function AuditPage() {
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleViewDetails = (log: AuditLogEntry) => {
    setSelectedLog(log)
    setDrawerOpen(true)
  }

  return (
    <div className="flex flex-1 flex-col">
      <AppHeader
        title="Audit Log"
        description="Track all system events and changes"
      />
      <main className="flex-1 space-y-6 p-6">
        <Card>
          <CardContent className="pt-6">
            <AuditTable logs={mockAuditLogs} onViewDetails={handleViewDetails} />
          </CardContent>
        </Card>
      </main>
      <AuditDetailDrawer
        log={selectedLog}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </div>
  )
}
