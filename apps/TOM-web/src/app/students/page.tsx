'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';

import type {
  Badge,
  Club,
  ClubRequest,
  SchoolEvent,
  TomCurrentUser,
  UserBadge,
  XpLog,
} from '@/lib/tom-types';

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

const WEEK_DAYS = [
  { key: 1, label: 'Даваа' },
  { key: 2, label: 'Мягмар' },
  { key: 3, label: 'Лхагва' },
  { key: 4, label: 'Пүрэв' },
  { key: 5, label: 'Баасан' },
  { key: 6, label: 'Бямба' },
  { key: 0, label: 'Ням' },
] as const;

const DAY_NAME_TO_INDEX: Record<string, number> = {
  даваа: 1,
  мягмар: 2,
  лхагва: 3,
  пүрэв: 4,
  баасан: 5,
  бямба: 6,
  ням: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
  sun: 0,
};

async function readJson<T>(response: Response) {
  const data = (await response.json().catch(() => null)) as
    | ({ error?: string } & T)
    | null;
  if (!response.ok) {
    throw new Error(
      data?.error || `Хүсэлт амжилтгүй боллоо (код: ${response.status}).`
    );
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

function startOfWeek(date: Date) {
  const next = new Date(date);
  const offset = (next.getDay() + 6) % 7;
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() - offset);
  return next;
}

function formatIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat('mn-MN', {
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function parseAllowedDays(value: string) {
  return value
    .split(/[,\u3001/]+/)
    .map((item) => item.trim().toLowerCase())
    .map((item) => DAY_NAME_TO_INDEX[item])
    .filter((item): item is number => item !== undefined);
}

export default function StudentDashboard() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<SchoolEvent[]>([]);
  const [joinedClubIds, setJoinedClubIds] = useState<string[]>([]);
  const [xpTotal, setXpTotal] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState<
    Array<UserBadge & { badge: Badge }>
  >([]);
  const [totalBadgeCount, setTotalBadgeCount] = useState(0);
  const [activity, setActivity] = useState<
    StudentDashboardResponse['activity']
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const data = await apiRequest<StudentDashboardResponse>(
          '/api/students/dashboard'
        );
        if (!cancelled) {
          setClubs(data.clubs);
          setEvents(data.events);
          setUpcomingEvents(data.upcomingEvents);
          setJoinedClubIds(data.joinedClubIds);
          setXpTotal(data.xp.total);
          setEarnedBadges(data.badges.earned);
          setTotalBadgeCount(data.badges.total);
          setActivity(data.activity);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Өгөгдлийг ачаалж чадсангүй.'
          );
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
    () =>
      clubs
        .slice()
        .sort((left, right) => left.name.localeCompare(right.name))
        .slice(0, 5),
    [clubs]
  );

  const nextMeeting = useMemo(() => {
    const upcoming = events
      .filter((event) => event.status === 'upcoming')
      .sort((left, right) =>
        sortByDateAscending(left.eventDate, right.eventDate)
      );
    return upcoming[0] ?? null;
  }, [events]);

  const weeklySchedule = useMemo(() => {
    const weekStart = startOfWeek(new Date());
    const todayIso = formatIsoDate(new Date());
    const joinedClubIdSet = new Set(joinedClubIds);
    const joinedClubs = clubs.filter((club) => joinedClubIdSet.has(club.id));

    return WEEK_DAYS.map((day, index) => {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + index);
      const isoDate = formatIsoDate(currentDate);

      const clubItems = joinedClubs
        .filter((club) => parseAllowedDays(club.allowedDays).includes(day.key))
        .map((club) => ({
          id: `club-${club.id}-${day.key}`,
          kind: 'club' as const,
          title: club.name,
          meta: club.teacherName || 'Клуб',
        }));

      const eventItems = upcomingEvents
        .filter((event) => event.eventDate === isoDate)
        .map((event) => ({
          id: `event-${event.id}`,
          kind: 'event' as const,
          title: event.title,
          meta:
            [event.startTime, event.location].filter(Boolean).join(' · ') ||
            'Арга хэмжээ',
        }));

      return {
        ...day,
        isoDate,
        dateLabel: formatShortDate(currentDate),
        isToday: isoDate === todayIso,
        items: [...clubItems, ...eventItems],
      };
    });
  }, [clubs, joinedClubIds, upcomingEvents]);

  const weeklyItemCount = useMemo(
    () => weeklySchedule.reduce((sum, day) => sum + day.items.length, 0),
    [weeklySchedule]
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-5">
        <article className="rounded-[28px] border border-[#dce7f8] bg-white p-5 shadow-soft">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4 text-[#183153]">
              <CalendarDays className="h-5 w-5 text-[color:var(--primary)]" />
              <div>
                <h2 className="text-md font-semibold">
                  Энэ долоо хоногийн календарь
                </h2>
                <p className="text-sm text-[#6f86a7]">
                  Клубийн өдрүүд болон event-үүдийг 7 хоногоор харуулна.
                </p>
              </div>
            </div>
            <div className="rounded-2xl bg-[color:var(--surface)] px-4 py-3 text-sm text-[#183153]">
              <p className="font-semibold">{weeklyItemCount} хуваарь</p>
              <p className="text-[#6f86a7]">Энэ долоо хоногт</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-7">
            {weeklySchedule.map((day) => (
              <div
                key={day.isoDate}
                className={`flex min-h-[220px] flex-col rounded-[24px] border p-4 ${
                  day.isToday
                    ? 'border-[color:var(--primary)] bg-[#eef5ff]'
                    : 'border-[#dce7f8] bg-[color:var(--surface)]'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-[#183153]">
                      {day.label}
                    </p>
                    <p className="text-xs text-[#6f86a7]">{day.dateLabel}</p>
                  </div>
                  {day.isToday ? (
                    <span className="rounded-full bg-[color:var(--primary)] px-2 py-1 text-[11px] font-semibold text-white">
                      Өнөөдөр
                    </span>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-1 flex-col gap-2">
                  {day.items.length === 0 ? (
                    <p className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-[#c8d8ee] px-3 py-4 text-center text-xs text-[#6f86a7]">
                      Төлөвлөгөө байхгүй
                    </p>
                  ) : (
                    day.items.map((item) => (
                      <div
                        key={item.id}
                        className={`rounded-2xl px-3 py-3 text-xs ${
                          item.kind === 'club'
                            ? 'bg-white text-[#183153]'
                            : 'bg-[#183153] text-white'
                        }`}
                      >
                        <p className="font-semibold">{item.title}</p>
                        <p
                          className={
                            item.kind === 'club'
                              ? 'mt-1 text-[#6f86a7]'
                              : 'mt-1 text-white/75'
                          }
                        >
                          {item.meta}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <article className="flex h-full flex-col rounded-[28px] border border-[#dce7f8] bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2 text-[#183153]">
            <Users className="h-5 w-5 text-[color:var(--primary)]" />
            <h2 className="text-md font-semibold">Миний клубүүд</h2>
          </div>
          <div className="mt-4 space-y-3">
            {isLoading ? (
              <p className="text-sm text-[#6f86a7]">Ачаалж байна...</p>
            ) : myClubs.length === 0 ? (
              <p className="text-sm text-[#6f86a7]">
                Одоогоор танд нэгдсэн клуб алга байна.
              </p>
            ) : (
              myClubs.map((club) => (
                <div
                  key={club.id}
                  className="flex items-center justify-between rounded-2xl bg-[color:var(--surface)] p-4"
                >
                  <p className="font-semibold text-[#183153] text-md">
                    {club.name}
                  </p>
                </div>
              ))
            )}
          </div>
          <Link
            href="/students/clubs"
            className="mt-auto inline-flex items-center gap-1 self-end pt-4 text-sm font-semibold text-[color:var(--primary)] hover:underline"
          >
            Бүгдийг харах <ArrowRight className="h-4 w-4" />
          </Link>
        </article>

        <article className="flex h-full flex-col rounded-[28px] border border-[#dce7f8] bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2 text-[#183153]">
            <CalendarDays className="h-5 w-5 text-[color:var(--primary)]" />
            <h2 className="text-md font-semibold">Дараагийн уулзалт</h2>
          </div>
          <div className="mt-4 rounded-2xl bg-[color:var(--surface)] px-4 py-4">
            {isLoading ? (
              <p className="text-sm text-[#6f86a7]">Ачаалж байна...</p>
            ) : nextMeeting ? (
              <>
                <p className="text-base font-semibold text-[#183153]">
                  {nextMeeting.title}
                </p>
                <p className="mt-1 text-sm text-[#6f86a7]">
                  {nextMeeting.eventDate}
                  {nextMeeting.startTime ? ` · ${nextMeeting.startTime}` : ''}
                  {nextMeeting.location ? ` · ${nextMeeting.location}` : ''}
                </p>
              </>
            ) : (
              <p className="text-sm text-[#6f86a7]">
                Төлөвлөгдсөн уулзалт алга байна.
              </p>
            )}
          </div>
          <Link
            href="/students/events"
            className="mt-auto inline-flex self-end pt-4 text-sm font-semibold text-[color:var(--primary)] hover:underline"
          >
            Арга хэмжээ рүү очих <ArrowRight className="h-4 w-4" />
          </Link>
        </article>

        <article className="flex h-full flex-col rounded-[28px] border border-[#dce7f8] bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2 text-[#183153]">
            <Sparkles className="h-5 w-5 text-[color:var(--primary)]" />
            <h2 className="text-md font-semibold">Gamification</h2>
          </div>
          <div className="mt-4 rounded-2xl bg-[color:var(--surface)] px-4 py-4">
            <p className="text-sm text-[#6f86a7]">Нийт XP</p>
            <p className="mt-1 text-2xl font-bold text-[#183153]">{xpTotal}</p>
            <p className="mt-2 text-xs text-[#6f86a7]">
              Badge: {earnedBadges.length}/{totalBadgeCount}
            </p>
          </div>
          <Link
            href="/students/gamification"
            className="mt-auto inline-flex self-end pt-4 text-sm font-semibold text-[color:var(--primary)] hover:underline"
          >
            XP болон badge дэлгэрэнгүй
            <ArrowRight className="h-4 w-4" />
          </Link>
        </article>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-[28px] border border-[#dce7f8] bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2 text-[#183153]">
            <Trophy className="h-5 w-5 text-[color:var(--primary)]" />
            <h2 className="text-md font-semibold">Сүүлийн үйл ажиллагаа</h2>
          </div>
          <div className="mt-4 space-y-3">
            {activity.length === 0 ? (
              <p className="text-sm text-[#6f86a7]">
                Одоогоор activity алга байна.
              </p>
            ) : (
              activity.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-[color:var(--surface)] px-4 py-3"
                >
                  <p className="text-sm font-semibold text-[#183153]">
                    {item.title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#6f86a7]">
                    {item.detail}
                  </p>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-[28px] border border-[#dce7f8] bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2 text-[#183153]">
            <CalendarDays className="h-5 w-5 text-[color:var(--primary)]" />
            <h2 className="text-md font-semibold">Удахгүй болох event-үүд</h2>
          </div>
          <div className="mt-4 space-y-3">
            {upcomingEvents.slice(0, 5).map((event) => (
              <div
                key={event.id}
                className="rounded-2xl bg-[color:var(--surface)] px-4 py-3"
              >
                <p className="text-sm font-semibold text-[#183153]">
                  {event.title}
                </p>
                <p className="mt-1 text-xs leading-5 text-[#6f86a7]">
                  {event.eventDate}
                  {event.startTime ? ` · ${event.startTime}` : ''}
                  {event.location ? ` · ${event.location}` : ''}
                </p>
              </div>
            ))}
            {upcomingEvents.length === 0 ? (
              <p className="text-sm text-[#6f86a7]">
                Удахгүй event алга байна.
              </p>
            ) : null}
          </div>
          <Link
            href="/students/events"
            className="mt-4 inline-flex text-sm font-semibold text-[color:var(--primary)] hover:underline"
          >
            Бүх event харах
          </Link>
        </article>
      </section>
    </div>
  );
}
