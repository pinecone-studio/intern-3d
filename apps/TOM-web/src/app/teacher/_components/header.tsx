'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Users,
} from 'lucide-react';

import { useTomSession } from '@/app/_providers/tom-session-provider';

const navItems = [
  { href: '/teacher', label: 'Хянах самбар', icon: LayoutDashboard },
  { href: '/teacher/clubs', label: 'Клубүүд', icon: Users },
  { href: '/teacher/events', label: 'Үйл ажиллагаа', icon: CalendarDays },
] as const;

function normalizePathname(pathname: string) {
  return pathname !== '/' && pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname;
}

export default function TeacherHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticating } = useTomSession();
  const normalizedPathname = normalizePathname(pathname);
  const activeHref =
    navItems.find(({ href }) => normalizedPathname === href)?.href ??
    navItems
      .filter(
        ({ href }) =>
          href !== '/teacher' && normalizedPathname.startsWith(`${href}/`)
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
      <div className="grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <Link href="/" className="flex items-center gap-3 justify-self-start">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#49a0e3] text-white shadow-[0_10px_22px_rgba(24,58,112,0.18)]">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#49a0e3]">
              Сургуулийн клуб
            </p>
            <p className="text-xs text-black">
              {user ? `${user.name} · Багш` : 'Багшийн хэсэг'}
            </p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center justify-center gap-2 justify-self-center">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = activeHref === href;
            return (
              <Link
                key={href}
                href={href}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-[#49a0e3] text-white shadow-[0_12px_24px_rgba(24,58,112,0.22)]'
                    : 'text-[#4a6080] hover:bg-[#eef4ff] hover:text-[#49a0e3]'
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
          className="inline-flex items-center gap-2 justify-self-start rounded-full border border-[#e2eaf5] bg-white px-4 py-2 text-sm font-semibold text-[#4a6080] transition hover:bg-[#eef4ff] hover:text-[#49a0e3] disabled:cursor-not-allowed disabled:opacity-60 lg:justify-self-end"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {isAuthenticating ? 'Гарч байна...' : 'Гарах'}
        </button>
      </div>
    </header>
  );
}
