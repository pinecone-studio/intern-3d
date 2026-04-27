'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, CalendarDays, GraduationCap, LogOut, Users } from 'lucide-react';

const navItems = [
  { href: '/students/clubs', label: 'Клубүүд', icon: Users },
  { href: '/students/events', label: 'Дараагийн уулзалт', icon: CalendarDays },
  { href: '/students', label: 'Мэдэгдэл', icon: Bell },
] as const;

function normalizePathname(pathname: string) {
  return pathname !== '/' && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

export default function StudentHeader() {
  const pathname = usePathname();
  const normalizedPathname = normalizePathname(pathname);
  const activeHref =
    navItems.find(({ href }) => normalizedPathname === href)?.href ??
    navItems
      .filter(({ href }) => href !== '/students' && normalizedPathname.startsWith(`${href}/`))
      .sort((left, right) => right.href.length - left.href.length)[0]?.href;

  return (
    <header className="rounded-[28px] border border-[#dce7f8] bg-white/95 px-5 py-4 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1a3560] text-white shadow-[0_10px_22px_rgba(24,58,112,0.18)]">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1a3560]">
              Сургуулийн клубүүд
            </p>
            <p className="text-xs text-[#7a90af]">Сурагч</p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = activeHref === href;
            return (
              <Link
                key={href}
                href={href}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
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

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-[#e2eaf5] bg-white px-4 py-2 text-sm font-semibold text-[#4a6080] transition hover:bg-[#eef4ff] hover:text-[#1a3560]"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Гарах
        </Link>
      </div>
    </header>
  );
}
