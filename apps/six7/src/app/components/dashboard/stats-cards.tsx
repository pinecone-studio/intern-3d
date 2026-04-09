import {
  CheckCircle2,
  Clock3,
  FileText,
  TimerReset,
  XCircle,
  Zap,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DashboardStats } from '@/lib/types'

type StatsCardsProps = {
  stats: DashboardStats
}

const statsConfig = [
  {
    label: 'Total Documents',
    icon: FileText,
    getValue: (stats: DashboardStats) => stats.totalDocuments.toLocaleString(),
  },
  {
    label: 'Total Actions',
    icon: Zap,
    getValue: (stats: DashboardStats) => stats.totalActions.toLocaleString(),
  },
  {
    label: 'Success Rate',
    icon: CheckCircle2,
    getValue: (stats: DashboardStats) => `${stats.successRate}%`,
  },
  {
    label: 'Failed Jobs',
    icon: XCircle,
    getValue: (stats: DashboardStats) => stats.failedJobs.toString(),
  },
  {
    label: 'Pending Jobs',
    icon: Clock3,
    getValue: (stats: DashboardStats) => stats.pendingJobs.toString(),
  },
  {
    label: 'Avg Processing',
    icon: TimerReset,
    getValue: (stats: DashboardStats) => stats.avgProcessingTime,
  },
] as const

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {statsConfig.map((config) => {
        const Icon = config.icon
        return (
          <Card key={config.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {config.label}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.8} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{config.getValue(stats)}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
