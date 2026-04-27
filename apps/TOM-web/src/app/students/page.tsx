'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Bell, CalendarDays, Users } from 'lucide-react';

import type { Club, ClubRequest, SchoolEvent } from '@/lib/tom-types';

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

export default function StudentDashboard() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [requests, setRequests] = useState<ClubRequest[]>([]);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [clubData, requestData, eventData] = await Promise.all([
          apiRequest<{ clubs: Club[] }>('/api/clubs'),
          apiRequest<{ requests: ClubRequest[] }>(
            '/api/club-requests?requestStatus=pending'
          ),
          apiRequest<{ events: SchoolEvent[] }>('/api/events').catch(() => ({
            events: [],
          })),
        ]);

        if (!cancelled) {
          setClubs(clubData.clubs);
          setRequests(requestData.requests);
          setEvents(eventData.events);
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
        if (!cancelled) {
          setIsLoading(false);
        }
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
        .filter((club) => club.status === 'active')
        .sort((left, right) => left.name.localeCompare(right.name))
        .slice(0, 5),
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
      return [
        {
          title: 'Ачаалж байна',
          detail: 'Түр хүлээнэ үү.',
        },
      ];
    }

    const items: Array<{ title: string; detail: string }> = [];

    if (requests.length > 0) {
      items.push({
        title: 'Хүлээгдэж буй хүсэлт',
        detail: `${requests.length} клуб нээх хүсэлт байна.`,
      });
    }

    if (nextMeeting) {
      items.push({
        title: 'Удахгүй болох арга хэмжээ',
        detail: `${nextMeeting.title} · ${nextMeeting.eventDate}`,
      });
    }

    if (items.length === 0) {
      items.push({
        title: 'Шинэ мэдэгдэл алга',
        detail: 'Одоогоор шинэ мэдээлэлгүй байна.',
      });
    }

    return items;
  }, [isLoading, nextMeeting, requests.length]);

  return (
    <div className="space-y-6">
      <section className="grid gap-5 lg:grid-cols-3">
        <article className="rounded-[28px] border border-[#dce7f8] bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2 text-[#183153]">
            <Users className="h-5 w-5 text-[color:var(--primary)]" />
            <h2 className="text-lg font-semibold">Миний клубүүд</h2>
          </div>

          <div className="mt-4 space-y-3">
            {isLoading ? (
              <p className="text-sm text-[#6f86a7]">Ачаалж байна...</p>
            ) : myClubs.length === 0 ? (
              <p className="text-sm text-[#6f86a7]">
                Одоогоор идэвхтэй клуб алга байна.
              </p>
            ) : (
              myClubs.map((club) => (
                <div
                  key={club.id}
                  className="flex items-center justify-between rounded-2xl bg-[color:var(--surface)] px-4 py-3"
                >
                  <p className="font-semibold text-[#183153]">{club.name}</p>
                  <span className="text-xs font-semibold text-[#5f7697]">
                    {club.memberCount} гишүүн
                  </span>
                </div>
              ))
            )}
          </div>

          <Link
            href="/students/clubs"
            className="mt-4 inline-flex text-sm font-semibold text-[color:var(--primary)] hover:underline"
          >
            Бүгдийг харах
          </Link>
        </article>

        <article className="rounded-[28px] border border-[#dce7f8] bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2 text-[#183153]">
            <CalendarDays className="h-5 w-5 text-[color:var(--primary)]" />
            <h2 className="text-lg font-semibold">Дараагийн уулзалт</h2>
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
            className="mt-4 inline-flex text-sm font-semibold text-[color:var(--primary)] hover:underline"
          >
            Арга хэмжээ рүү очих
          </Link>
        </article>

        <article className="rounded-[28px] border border-[#dce7f8] bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2 text-[#183153]">
            <Bell className="h-5 w-5 text-[color:var(--primary)]" />
            <h2 className="text-lg font-semibold">Мэдэгдэл</h2>
          </div>

          {errorMessage ? (
            <p className="mt-4 rounded-2xl border border-[#ffd2d5] bg-[#fff7f8] px-4 py-3 text-sm text-[#b23a49]">
              {errorMessage}
            </p>
          ) : null}

          <div className="mt-4 space-y-3">
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
        </article>
      </section>
    </div>
  );
}
