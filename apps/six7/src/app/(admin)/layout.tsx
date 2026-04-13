import { AppSidebar } from '@/components/app-sidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar />
      <div>{children}</div>
    </div>
  )
}
