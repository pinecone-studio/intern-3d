'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bell,
  ClipboardList,
  FileText,
  LayoutDashboard,
  PlayCircle,
  Settings,
  Settings2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Хяналтын самбар', href: '/', icon: LayoutDashboard },
  { label: 'Баримтууд', href: '/documents', icon: FileText },
  { label: 'Аудитын бүртгэл', href: '/audit', icon: ClipboardList },
  { label: 'Үйлдлийн бүртгэл', href: '/registry', icon: Settings2 },
  { label: 'Гараар эхлүүлэх', href: '/trigger', icon: PlayCircle },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-30 border-b border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[0_20px_40px_-30px_rgba(45,49,66,0.55)]">
      <div className="flex w-full items-center gap-4 overflow-x-auto px-2 py-4 md:px-3">
        <div className="flex shrink-0 items-center gap-3 pr-2">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-[0_10px_24px_-16px_rgba(239,131,84,0.9)]">
              E
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-[0.08em] text-sidebar-foreground">
                EPAS
              </span>
              <span className="text-xs text-sidebar-foreground/65">
                Баримт бичгийн автоматжуулалт
              </span>
            </div>
          </Link>
        </div>
        <nav
          aria-label="Үндсэн цэс"
          className="flex min-w-max flex-1 gap-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {navItems.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'inline-flex min-w-max items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all',
                  active
                    ? 'border-primary/50 bg-sidebar-primary text-sidebar-primary-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                    : 'border-transparent text-sidebar-foreground/78 hover:border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.8} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <button
            type="button"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-sidebar-border/80 bg-sidebar-accent/25 text-sidebar-foreground transition-colors hover:border-primary/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Bell className="h-4 w-4" strokeWidth={1.8} />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-primary" />
          </button>
          <Link
            href="/settings"
            className={cn(
              'inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors',
              pathname === '/settings'
                ? 'border-primary/50 bg-sidebar-primary text-sidebar-primary-foreground'
                : 'border-sidebar-border/80 text-sidebar-foreground/78 hover:border-primary/40 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            )}
          >
            <Settings className="h-4 w-4" strokeWidth={1.8} />
            <span>Тохиргоо</span>
          </Link>
          <button
            type="button"
            className="inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-sidebar-border/80 bg-sidebar-accent/25 px-3 text-sm font-semibold text-sidebar-foreground transition-colors hover:border-primary/40 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            ХН
          </button>
        </div>
      </div>
    </header>
  )
}
