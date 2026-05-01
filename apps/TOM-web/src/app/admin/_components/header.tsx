'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  CalendarDays,
  GitPullRequest,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Users,
} from 'lucide-react';

import { useTomSession } from '@/app/_providers/tom-session-provider';

const navItems = [
  { href: '/admin', label: 'Админ самбар', icon: LayoutDashboard },
  { href: '/admin/requests', label: 'Хүсэлтүүд', icon: GitPullRequest },
  { href: '/admin/events', label: 'Арга хэмжээ', icon: CalendarDays },
  { href: '/admin/clubs', label: 'Клуб', icon: Users },
  { href: '/admin/teacher', label: 'Багш', icon: CalendarDays },
] as const;

const hiddenNavItemHrefs = ['/admin/teacher'];
const visibleNavItems = navItems.filter(
  ({ href }) => !hiddenNavItemHrefs.includes(href)
);

function normalizePathname(pathname: string) {
  return pathname !== '/' && pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname;
}

export default function AdminHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticating } = useTomSession();
  const normalizedPathname = normalizePathname(pathname);
  const activeHref =
    visibleNavItems.find(({ href }) => normalizedPathname === href)?.href ??
    visibleNavItems
      .filter(
        ({ href }) =>
          href !== '/admin' && normalizedPathname.startsWith(`${href}/`)
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
      <div className="flex flex-nowrap items-center gap-3 overflow-x-auto">
        <Link href="/" className="flex flex-none items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#49a0e3] text-white shadow-[0_10px_22px_rgba(24,58,112,0.18)]">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex flex-col items-start gap-2 whitespace-nowrap">
            <p className="text-sm font-semibold text-[#1a3560]">
              Сургуулийн клуб
            </p>
            <p className="text-xs text-black">
              {user ? `${user.name} · Админ` : 'Админы харагдац'}
            </p>
          </div>
        </Link>

        <nav className="ml-auto flex flex-none items-center gap-2">
          {visibleNavItems.map(({ href, label, icon: Icon }) => {
            const isActive = activeHref === href;
            return (
              <Link
                key={href}
                href={href}
                className={`inline-flex flex-none items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-[#49a0e3] text-white shadow-[0_12px_24px_rgba(24,58,112,0.22)]'
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
          className="inline-flex flex-none items-center gap-2 rounded-full border border-[#e2eaf5] bg-white px-4 py-2 text-sm font-semibold text-[#4a6080] transition hover:bg-[#eef4ff] hover:text-[#1a3560] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {isAuthenticating ? 'Гарч байна...' : 'Гарах'}
        </button>
      </div>
    </header>
  );
}
