'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ListCheck,
  GraduationCap,
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Admin Panel', icon: LayoutDashboard },
  { href: '/admin/clubs', label: 'Clubs', icon: Users },
  { href: '/admin/teacher', label: 'Teacher Panel', icon: CalendarDays },
  { href: '/admin/analytics', label: 'Analytics', icon: ListCheck },
];

export default function AdminLayout() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-56 flex-col border-r border-[#e2eaf5] bg-white shadow-[2px_0_12px_rgba(20,50,100,0.06)]">
      <Link href="/">
        <div className="flex items-center gap-3 border-b border-[#e8eef8] px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1a3560] text-sm font-bold text-white">
            <GraduationCap />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1a3560]">School Clubs</p>
            <p className="text-xs text-[#7a90af]">Admin view</p>
          </div>
        </div>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== '/students' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#1a3560] text-white shadow-[0_4px_12px_rgba(26,53,96,0.25)]'
                  : 'text-[#4a6080] hover:bg-[#eef4ff] hover:text-[#1a3560]'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
