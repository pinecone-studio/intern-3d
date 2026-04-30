'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Bell, CalendarDays, Sparkles, Trophy, Users } from 'lucide-react';

import { useTomSession } from '@/app/_providers/tom-session-provider';
import type { Badge, Club, ClubRequest, SchoolEvent, TomCurrentUser, UserBadge, XpLog } from '@/lib/tom-types';

type StudentDashboardResponse = {
  user: TomCurrentUser;
  joinedClubIds: string[];
  clubs: Club[];
  requests: ClubRequest[];
  events: SchoolEvent[];
  upcomingEvents: SchoolEvent[];
  xp: {
    total: number;
    logs: XpLog[];
  };
  badges: {
    earned: Array<UserBadge & { badge: Badge }>;
    total: number;
  };
  activity: Array<{
    id: string;
    type: string;
    title: string;
    detail: string;
    createdAt: string;
  }>;
};

async function readJson<T>(response: Response) {
  const data = (await response.json().catch(() => null)) as ({ error?: string } & T) | null;
  if (!response.ok) {
    throw new Error(data?.error || `Хүсэлт амжилтгүй боллоо (код: ${response.status}).`);
  }
  return data as T;
}

async function apiRequest<T>(input: string, init?: RequestInit) {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }
  const response = await fetch(input, { ...init, headers });
  return readJson<T>(response);
}

function sortByDateAscending(left: string, right: string) {
  return left.localeCompare(right);
}

export default function StudentDashboard() {
  const { user } = useTomSession();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [requests, setRequests] = useState<ClubRequest[]>([]);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<SchoolEvent[]>([]);
  const [joinedClubIds, setJoinedClubIds] = useState<string[]>([]);
  const [xpTotal, setXpTotal] = useState(0);
  const [xpLogs, setXpLogs] = useState<XpLog[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<Array<UserBadge & { badge: Badge }>>([]);
  const [totalBadgeCount, setTotalBadgeCount] = useState(0);
  const [activity, setActivity] = useState<StudentDashboardResponse['activity']>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const data = await apiRequest<StudentDashboardResponse>('/api/students/dashboard');
        if (!cancelled) {
          setClubs(data.clubs);
          setRequests(data.requests);
          setEvents(data.events);
          setUpcomingEvents(data.upcomingEvents);
          setJoinedClubIds(data.joinedClubIds);
          setXpTotal(data.xp.total);
          setXpLogs(data.xp.logs);
          setEarnedBadges(data.badges.earned);
          setTotalBadgeCount(data.badges.total);
          setActivity(data.activity);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : 'Өгөгдлийг ачаалж чадсангүй.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  const myClubs = useMemo(
    () => clubs.slice().sort((left, right) => left.name.localeCompare(right.name)).slice(0, 5),
    [clubs]
  );

  const nextMeeting = useMemo(() => {
    const upcoming = events
      .filter((event) => event.status === 'upcoming')
      .sort((left, right) => sortByDateAscending(left.eventDate, right.eventDate));
    return upcoming[0] ?? null;
  }, [events]);

  const notifications = useMemo(() => {
    if (isLoading) {
      return [{ title: 'Ачаалж байна', detail: 'Түр хүлээнэ үү.' }];
    }

    const items: Array<{ title: string; detail: string }> = [];

    if (joinedClubIds.length > 0) {
      items.push({ title: 'Таны клубийн тоо', detail: `Та одоогоор ${joinedClubIds.length} клубт нэгдсэн байна.` });
    }
    if (requests.length > 0) {
      items.push({ title: 'Таны клубийн хүсэлтүүд', detail: `${requests.length} хүсэлт тань системд байна.` });
    }
    if (nextMeeting) {
      items.push({ title: 'Удахгүй болох арга хэмжээ', detail: `${nextMeeting.title} · ${nextMeeting.eventDate}` });
    }
    if (user?.accountStatus === 'restricted') {
      items.push({ title: 'Хандалтын анхааруулга', detail: 'Таны бүртгэл түр хязгаарлагдсан төлөвтэй байна.' });
    }
    if (xpTotal > 0) {
      items.push({ title: 'XP өсөлт', detail: `Нийт XP: ${xpTotal}. Сүүлийн өөрчлөлт: ${xpLogs[0]?.amount ?? 0} XP` });
    }
    if (earnedBadges.length > 0) {
      items.push({ title: 'Badge ахиц', detail: `${earnedBadges.length}/${totalBadgeCount} badge нээгдсэн байна.` });
    }
    if (items.length === 0) {
      items.push({ title: 'Шинэ мэдэгдэл алга', detail: 'Одоогоор шинэ мэдээлэлгүй байна.' });
    }

    return items.slice(0, 4);
  }, [isLoading, joinedClubIds.length, requests.length, nextMeeting, user?.accountStatus, xpTotal, xpLogs, earnedBadges.length, totalBadgeCount]);

  return (
    <div className="space-y-6">
      <section className="grid gap-5 lg:grid-cols-4">
        <article className="flex h-full flex-col rounded-[28px] border border-[#dce7f8] bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2 text-[#183153]">
            <Users className="h-5 w-5 text-[color:var(--primary)]" />
            <h2 className="text-md font-semibold">Миний клубүүд</h2>
          </div>
          <div className="mt-4 space-y-3">
            {isLoading ? <p className="text-sm text-[#6f86a7]">Ачаалж байна...</p> : myClubs.length === 0 ? <p className="text-sm text-[#6f86a7]">Одоогоор таны нэгдсэн клуб алга байна.</p> : myClubs.map((club) => (
              <div key={club.id} className="flex items-center justify-between rounded-2xl bg-[color:var(--surface)] p-4">
                <p className="font-semibold text-[#183153] text-md">{club.name}</p>
          
              </div>
            ))}
          </div>
          <Link href="/students/clubs" className="mt-auto inline-flex items-center gap-1 self-end pt-4 text-sm font-semibold text-[color:var(--primary)] hover:underline">Бүгдийг харах <ArrowRight className="h-4 w-4" /></Link>
        </article>

        <article className="flex h-full flex-col rounded-[28px] border border-[#dce7f8] bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2 text-[#183153]">
            <CalendarDays className="h-5 w-5 text-[color:var(--primary)]" />
            <h2 className="text-md font-semibold">Дараагийн уулзалт</h2>
          </div>
          <div className="mt-4 rounded-2xl bg-[color:var(--surface)] px-4 py-4">
            {isLoading ? <p className="text-sm text-[#6f86a7]">Ачаалж байна...</p> : nextMeeting ? (
              <>
                <p className="text-base font-semibold text-[#183153]">{nextMeeting.title}</p>
                <p className="mt-1 text-sm text-[#6f86a7]">{nextMeeting.eventDate}{nextMeeting.startTime ? ` · ${nextMeeting.startTime}` : ''}{nextMeeting.location ? ` · ${nextMeeting.location}` : ''}</p>
              </>
            ) : <p className="text-sm text-[#6f86a7]">Төлөвлөгдсөн уулзалт алга байна.</p>}
          </div>
          <Link href="/students/events" className="mt-auto inline-flex self-end pt-4 text-sm font-semibold text-[color:var(--primary)] hover:underline">Арга хэмжээ рүү очих <ArrowRight className="h-4 w-4" /></Link>
        </article>

        <article className="flex h-full flex-col rounded-[28px] border border-[#dce7f8] bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2 text-[#183153]">
            <Sparkles className="h-5 w-5 text-[color:var(--primary)]" />
            <h2 className="text-md font-semibold">Gamification</h2>
          </div>
          <div className="mt-4 rounded-2xl bg-[color:var(--surface)] px-4 py-4">
            <p className="text-sm text-[#6f86a7]">Нийт XP</p>
            <p className="mt-1 text-2xl font-bold text-[#183153]">{xpTotal}</p>
            <p className="mt-2 text-xs text-[#6f86a7]">Badge: {earnedBadges.length}/{totalBadgeCount}</p>
          </div>
          <Link href="/students/gamification" className="mt-auto inline-flex self-end pt-4 text-sm font-semibold text-[color:var(--primary)] hover:underline">XP болон badge дэлгэрэнгүй<ArrowRight className="h-4 w-4" /></Link>
        </article>

        <article className="rounded-[28px] border border-[#dce7f8] bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2 text-[#183153]">
            <Bell className="h-5 w-5 text-[color:var(--primary)]" />
            <h2 className="text-md font-semibold">Мэдэгдэл</h2>
          </div>
          {errorMessage ? <p className="mt-4 rounded-2xl border border-[#ffd2d5] bg-[#fff7f8] px-4 py-3 text-sm text-[#b23a49]">{errorMessage}</p> : null}
          <div className="mt-4 space-y-3">
            {notifications.map((item) => (
              <div key={`${item.title}-${item.detail}`} className="rounded-2xl bg-[color:var(--surface)] px-4 py-3">
                <p className="text-sm font-semibold text-[#183153]">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-[#6f86a7]">{item.detail}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-[28px] border border-[#dce7f8] bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2 text-[#183153]">
            <Trophy className="h-5 w-5 text-[color:var(--primary)]" />
            <h2 className="text-md font-semibold">Сүүлийн үйл ажиллагаа</h2>
          </div>
          <div className="mt-4 space-y-3">
            {activity.length === 0 ? <p className="text-sm text-[#6f86a7]">Одоогоор activity алга байна.</p> : activity.map((item) => (
              <div key={item.id} className="rounded-2xl bg-[color:var(--surface)] px-4 py-3">
                <p className="text-sm font-semibold text-[#183153]">{item.title}</p>
                <p className="mt-1 text-xs leading-5 text-[#6f86a7]">{item.detail}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[28px] border border-[#dce7f8] bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2 text-[#183153]">
            <CalendarDays className="h-5 w-5 text-[color:var(--primary)]" />
            <h2 className="text-md font-semibold">Удахгүй болох event-үүд</h2>
          </div>
          <div className="mt-4 space-y-3">
            {upcomingEvents.slice(0, 5).map((event) => (
              <div key={event.id} className="rounded-2xl bg-[color:var(--surface)] px-4 py-3">
                <p className="text-sm font-semibold text-[#183153]">{event.title}</p>
                <p className="mt-1 text-xs leading-5 text-[#6f86a7]">{event.eventDate}{event.startTime ? ` · ${event.startTime}` : ''}{event.location ? ` · ${event.location}` : ''}</p>
              </div>
            ))}
            {upcomingEvents.length === 0 ? <p className="text-sm text-[#6f86a7]">Удахгүй event алга байна.</p> : null}
          </div>
          <Link href="/students/events" className="mt-4 inline-flex text-sm font-semibold text-[color:var(--primary)] hover:underline">Бүх event харах</Link>
        </article>
      </section>
    </div>
  );
}
