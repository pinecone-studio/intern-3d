import { AppHeader } from '@/components/app-header'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { RecentJobsTable } from '@/components/dashboard/recent-jobs-table'
import { ActivityFeed } from '@/components/dashboard/activity-feed'
import { ActionDistributionChart } from '@/components/dashboard/action-distribution-chart'
import { DemoFlow } from '@/components/dashboard/demo-flow'
import { mockDashboardStats } from '@/lib/mock-configs'
import { mockJobs, mockAuditLogs } from '@/lib/mock-data'

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col">
      <AppHeader
        title="Хяналтын самбар"
        description="Ажилтны баримт бичгийн автоматжуулалтын систем"
      />
      <main className="flex-1 space-y-6 p-6">
        <DemoFlow />
        <StatsCards stats={mockDashboardStats} />
        <div className="grid gap-6 lg:grid-cols-3">
          <RecentJobsTable jobs={mockJobs} />
          <div className="space-y-6">
            <QuickActions />
            <ActionDistributionChart />
            <ActivityFeed logs={mockAuditLogs} />
          </div>
        </div>
      </main>
    </div>
  )
}
