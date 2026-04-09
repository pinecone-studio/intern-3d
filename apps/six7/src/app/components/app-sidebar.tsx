'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ClipboardList,
  FileText,
  LayoutDashboard,
  PlayCircle,
  Settings,
  Settings2,
} from 'lucide-react'
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
  useSidebar,
} from '@/components/ui/sidebar'

const navItems = [
  { label: 'Хяналтын самбар', href: '/', icon: LayoutDashboard },
  { label: 'Баримтууд', href: '/documents', icon: FileText },
  { label: 'Аудитын бүртгэл', href: '/audit', icon: ClipboardList },
  { label: 'Үйлдлийн бүртгэл', href: '/registry', icon: Settings2 },
  { label: 'Гараар эхлүүлэх', href: '/trigger', icon: PlayCircle },
]

export function AppSidebar() {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()

  const closeMobile = () => setOpenMobile(false)

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground">
            E
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold">EPAS</span>
            <span className="text-xs text-muted-foreground">
              Баримт бичгийн автоматжуулалт
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Цэс</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const active = pathname === item.href
                const Icon = item.icon
                return (
                  <SidebarMenuItem key={item.href}>
                    <Link href={item.href} onClick={closeMobile}>
                      <SidebarMenuButton isActive={active}>
                        <Icon className="h-4 w-4" strokeWidth={1.8} />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/settings" onClick={closeMobile}>
              <SidebarMenuButton isActive={pathname === '/settings'}>
                <Settings className="h-4 w-4" strokeWidth={1.8} />
                <span>Тохиргоо</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
