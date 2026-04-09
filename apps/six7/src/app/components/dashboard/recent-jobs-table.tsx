import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/status-badge'
import type { Job } from '@/lib/types'
import { actionLabels } from '@/lib/mock-configs'

type RecentJobsTableProps = {
  jobs: Job[]
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function RecentJobsTable({ jobs }: RecentJobsTableProps) {
  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Recent Jobs</CardTitle>
        <Link href="/audit" className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary">
          View All
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.8} />
        </Link>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job ID</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Documents</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-mono text-xs">{job.id}</TableCell>
                <TableCell>{job.employeeName}</TableCell>
                <TableCell>{actionLabels[job.action]}</TableCell>
                <TableCell>{job.documentsCount}</TableCell>
                <TableCell>
                  <StatusBadge status={job.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(job.createdAt)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
