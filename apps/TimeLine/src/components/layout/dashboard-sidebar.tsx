'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useRole } from '@/lib/role-context'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Badge } from '@/components/ui/badge'
import {
  Clock,
  LayoutDashboard,
  Monitor,
  CalendarDays,
  LogOut,
} from 'lucide-react'

const studentNavItems = [
  { title: 'Хянах самбар', href: '/dashboard', icon: LayoutDashboard },
]

const adminNavItems = [
  { title: 'Хянах самбар', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Миний хуваарь', href: '/dashboard/my-schedule', icon: CalendarDays },
]
export function DashboardSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, role, logout } = useRole()

  const navItems = role === 'admin' ? adminNavItems : studentNavItems
  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <Sidebar className="border-r border-sidebar-border bg-background">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-sidebar-border bg-muted">
            <Clock className="h-5 w-5 text-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-sidebar-foreground">
              Academic TimeLine
            </span>
            <span className="text-xs text-muted-foreground">
              Өрөө удирдлага
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
            Үндсэн
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/dashboard' && pathname.startsWith(item.href))
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="h-10 rounded-md"
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {role === 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
              Удирдлага
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="mx-2 rounded-md border border-sidebar-border bg-muted p-3">
                <p className="text-xs text-muted-foreground">
                  Өрөөний хуваарь удирдахын тулд өрөөн дээр дарна уу
                </p>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {role === 'student' && user?.assignedDevice && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/70">
              Таны төхөөрөмж
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="mx-2 rounded-md border border-sidebar-border bg-muted p-3">
                <div className="flex items-center gap-2">
                  <Monitor className="h-4 w-4 text-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {user.assignedDevice.name}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Анги {user.assignedDevice.roomNumber}
                </p>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <div className="flex items-center gap-3 rounded-md border border-sidebar-border bg-muted p-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-sidebar-border bg-background">
            <span className="text-xs font-medium text-foreground">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {user?.name || 'Хэрэглэгч'}
            </p>
            <Badge
              variant="outline"
              className="h-5 rounded-md px-1.5 text-[10px]"
            >
              {role === 'admin' ? 'Админ' : 'Сурагч'}
            </Badge>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="mt-2 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="h-4 w-4" />
          <span>Гарах</span>
        </button>
      </SidebarFooter>
    </Sidebar>
  )
}
