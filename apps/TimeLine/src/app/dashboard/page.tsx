'use client'

import { AdminScheduler } from '@/app/dashboard/_components/admin-scheduler'
import { StudentDashboard } from '@/app/dashboard/_components/student-dashboard'
import { useRole } from '@/lib/role-context'

export default function DashboardPage() {
  const { role } = useRole()
  return role === 'admin' ? <AdminScheduler /> : <StudentDashboard />
}
