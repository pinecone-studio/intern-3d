'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ShieldAlert,
  LayoutGrid,
  GraduationCap,
  LogOut,
} from 'lucide-react';

import { useTomSession } from '@/app/_providers/tom-session-provider';

const navItems = [
  { key: 'admin', href: '/admin', label: 'Админ самбар', icon: LayoutDashboard },
  {
    key: 'requests',
    href: '/admin/requests',
    label: 'Хүсэлтүүд',
    icon: CalendarDays,
  },
  {
    key: 'club-status',
    href: '/admin/club-status',
    label: 'Клубын төлөв',
    icon: LayoutGrid,
  },
  {
    key: 'spam',
    href: '/admin/spam',
    label: 'Спам',
    icon: ShieldAlert,
  },
  {
    key: 'events',
    href: '/admin/events',
    label: 'Арга хэмжээ',
    icon: CalendarDays,
  },
  { key: 'clubs', href: '/admin/clubs', label: 'Клубүүд', icon: Users },
  {
    key: 'teacher',
    href: '/admin/teacher',
    label: 'Багшийн самбар',
    icon: CalendarDays,
  },
];

export default function SideBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticating } = useTomSession();
  const normalizedPathname =
    pathname !== '/' && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
  const activeHref =
    navItems.find(({ href }) => normalizedPathname === href)?.href ??
    navItems
      .filter(
        ({ href }) => href !== '/admin' && normalizedPathname.startsWith(`${href}/`)
      )
      .sort((left, right) => right.href.length - left.href.length)[0]?.href;

  async function handleLogout() {
    try {
      await logout();
      router.push('/');
    } catch {
      router.push('/');
    }
  }

  return (
    <header className="rounded-[28px] border border-[#dce7f8] bg-white/95 px-5 py-4 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#1a3560] text-white shadow-[0_10px_22px_rgba(24,58,112,0.18)]">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-[#1a3560]">
              Сургуулийн клубүүд
            </p>
            <p className="truncate text-xs text-[#7a90af]">
              {user ? `${user.name} · Админ` : 'Админы харагдац'}
            </p>
          </div>
        </Link>

        <nav className="flex flex-1 flex-wrap items-center justify-center gap-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = activeHref === href;
            return (
              <Link
                key={href}
                href={href}
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-[#1a3560] text-white shadow-[0_12px_24px_rgba(24,58,112,0.22)]'
                    : 'text-[#4a6080] hover:bg-[#eef4ff] hover:text-[#1a3560]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={isAuthenticating}
          className="inline-flex items-center gap-2 rounded-full border border-[#e2eaf5] bg-white px-4 py-2 text-sm font-semibold text-[#4a6080] transition hover:bg-[#eef4ff] hover:text-[#1a3560] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {isAuthenticating ? 'Гарч байна...' : 'Гарах'}
        </button>
      </div>
    </header>
  );
}
