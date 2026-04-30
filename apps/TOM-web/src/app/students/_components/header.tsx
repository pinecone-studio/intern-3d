'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  Bell,
  CalendarDays,
  GraduationCap,
  LayoutDashboardIcon,
  LogOut,
  Sparkles,
  Users,
} from 'lucide-react';

import { useTomSession } from '@/app/_providers/tom-session-provider';
import type {
  Badge,
  Club,
  ClubRequest,
  SchoolEvent,
  UserBadge,
  XpLog,
} from '@/lib/tom-types';

const navItems = [
  { href: '/students', label: 'Home', icon: LayoutDashboardIcon },
  { href: '/students/clubs', label: 'Клубүүд', icon: Users },
  { href: '/students/events', label: 'Events', icon: CalendarDays },
  { href: '/students/gamification', label: 'XP & Badge', icon: Sparkles },
] as const;

type StudentHeaderDashboardResponse = {
  joinedClubIds: string[];
  requests: ClubRequest[];
  clubs: Club[];
  events: SchoolEvent[];
  xp: {
    total: number;
    logs: XpLog[];
  };
  badges: {
    earned: Array<UserBadge & { badge: Badge }>;
    total: number;
  };
};

type NotificationItem = {
  title: string;
  detail: string;
};

function normalizePathname(pathname: string) {
  return pathname !== '/' && pathname.endsWith('/')
    ? pathname.slice(0, -1)
    : pathname;
}

export default function StudentHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticating } = useTomSession();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);
  const [notificationsError, setNotificationsError] = useState('');
  const [notificationData, setNotificationData] =
    useState<StudentHeaderDashboardResponse | null>(null);
  const normalizedPathname = normalizePathname(pathname);
  const activeHref =
    navItems.find(({ href }) => normalizedPathname === href)?.href ??
    navItems
      .filter(
        ({ href }) =>
          href !== '/students' && normalizedPathname.startsWith(`${href}/`)
      )
      .sort((left, right) => right.href.length - left.href.length)[0]?.href;

  useEffect(() => {
    let cancelled = false;

    const loadNotifications = async () => {
      setIsLoadingNotifications(true);
      setNotificationsError('');
      try {
        const response = await fetch('/api/students/dashboard');
        const data = (await response.json().catch(() => null)) as
          | (StudentHeaderDashboardResponse & { error?: string })
          | null;

        if (!response.ok) {
          throw new Error(data?.error || 'Мэдэгдлийг ачаалж чадсангүй.');
        }

        if (!cancelled) {
          setNotificationData(data);
        }
      } catch (error) {
        if (!cancelled) {
          setNotificationsError(
            error instanceof Error
              ? error.message
              : 'Мэдэгдлийг ачаалж чадсангүй.'
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingNotifications(false);
        }
      }
    };

    void loadNotifications();

    return () => {
      cancelled = true;
    };
  }, []);

  const notifications = useMemo(() => {
    if (isLoadingNotifications) {
      return [{ title: 'Ачаалж байна', detail: 'Түр хүлээнэ үү.' }];
    }

    if (notificationsError) {
      return [{ title: 'Алдаа гарлаа', detail: notificationsError }];
    }

    const items: NotificationItem[] = [];
    const joinedClubIds = notificationData?.joinedClubIds ?? [];
    const requests = notificationData?.requests ?? [];
    const events = notificationData?.events ?? [];
    const xpTotal = notificationData?.xp.total ?? 0;
    const xpLogs = notificationData?.xp.logs ?? [];
    const earnedBadges = notificationData?.badges.earned ?? [];
    const totalBadgeCount = notificationData?.badges.total ?? 0;
    const nextMeeting = events
      .filter((event) => event.status === 'upcoming')
      .sort((left, right) => left.eventDate.localeCompare(right.eventDate))[0];

    if (joinedClubIds.length > 0) {
      items.push({
        title: 'Таны клубийн тоо',
        detail: `Та одоогоор ${joinedClubIds.length} клубт нэгдсэн байна.`,
      });
    }
    if (requests.length > 0) {
      items.push({
        title: 'Таны клубийн хүсэлтүүд',
        detail: `${requests.length} хүсэлт тань системд байна.`,
      });
    }
    if (nextMeeting) {
      items.push({
        title: 'Удахгүй болох арга хэмжээ',
        detail: `${nextMeeting.title} · ${nextMeeting.eventDate}`,
      });
    }
    if (user?.accountStatus === 'restricted') {
      items.push({
        title: 'Хандалтын анхааруулга',
        detail: 'Таны бүртгэл түр хязгаарлагдсан төлөвтэй байна.',
      });
    }
    if (xpTotal > 0) {
      items.push({
        title: 'XP өсөлт',
        detail: `Нийт XP: ${xpTotal}. Сүүлийн өөрчлөлт: ${
          xpLogs[0]?.amount ?? 0
        } XP`,
      });
    }
    if (earnedBadges.length > 0) {
      items.push({
        title: 'Badge ахиц',
        detail: `${earnedBadges.length}/${totalBadgeCount} badge нээгдсэн байна.`,
      });
    }
    if (items.length === 0) {
      items.push({
        title: 'Шинэ мэдэгдэл алга',
        detail: 'Одоогоор шинэ мэдээлэлгүй байна.',
      });
    }

    return items.slice(0, 4);
  }, [
    isLoadingNotifications,
    notificationData,
    notificationsError,
    user?.accountStatus,
  ]);

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
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#49a0e3] text-white shadow-[0_10px_22px_rgba(24,58,112,0.18)]">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#49a0e3]">
              Сургуулийн клубүүд
            </p>
            <p className="text-xs text-[#7a90af]">
              {user ? `${user.name} · Сурагч` : 'Сурагч'}
            </p>
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
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotificationsOpen((current) => !current)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#dce7f8] bg-white text-[color:var(--primary)] transition hover:bg-[#eef4ff]"
            aria-label="Мэдэгдэл харах"
            aria-expanded={isNotificationsOpen}
          >
            <Bell className="h-5 w-5" />
          </button>

          {notifications.length > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#49a0e3] px-1 text-[10px] font-semibold text-white">
              {notifications.length}
            </span>
          ) : null}

          {isNotificationsOpen ? (
            <div className="absolute right-0 z-20 mt-3 w-[320px] rounded-[24px] border border-[#dce7f8] bg-white p-4 shadow-[0_24px_60px_rgba(24,58,112,0.16)]">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#183153]">
                  Мэдэгдэл
                </h3>
                <button
                  type="button"
                  onClick={() => setIsNotificationsOpen(false)}
                  className="text-xs font-medium text-[#6f86a7] hover:text-[#183153]"
                >
                  Хаах
                </button>
              </div>

              <div className="mt-3 space-y-3">
                {notifications.map((item) => (
                  <div
                    key={`${item.title}-${item.detail}`}
                    className="rounded-2xl bg-[color:var(--surface)] px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-[#183153]">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#6f86a7]">
                      {item.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => void handleLogout()}
          disabled={isAuthenticating}
          className="inline-flex items-center gap-2 rounded-full border border-[#e2eaf5] bg-white px-4 py-2 text-sm font-semibold text-[#4a6080] transition hover:bg-[#eef4ff] hover:text-[#49a0e3]"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {isAuthenticating ? 'Гарч байна...' : 'Гарах'}
        </button>
      </div>
    </header>
  );
}
