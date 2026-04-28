'use client';

import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { CalendarDays, MapPin, Search, Users } from 'lucide-react';

import type { SchoolEvent } from '@/lib/tom-types';

type EventsResponse = { events: SchoolEvent[] };
type DashboardResponse = { events: SchoolEvent[] };

const EVENT_DEFAULT_CAPACITY = 30;

async function readJson<T>(response: Response) {
  const data = (await response.json().catch(() => null)) as ({ error?: string; message?: string } & T) | null;
  if (!response.ok) {
    throw new Error(data?.error || data?.message || `Request failed: ${response.status}`);
  }
  return data as T;
}

async function apiRequest<T>(input: string, init?: RequestInit) {
  const response = await fetch(input, init);
  return readJson<T>(response);
}

export default function EventsPage() {
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [joinedEventIds, setJoinedEventIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [pendingEventId, setPendingEventId] = useState('');
  const [banner, setBanner] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = async () => {
    const query = new URLSearchParams();
    if (statusFilter !== 'all') query.set('status', statusFilter);
    if (deferredSearch.trim()) query.set('q', deferredSearch.trim());

    const suffix = query.toString() ? `?${query.toString()}` : '';
    const [eventData, dashboardData] = await Promise.all([
      apiRequest<EventsResponse>(`/api/events${suffix}`),
      apiRequest<DashboardResponse>('/api/students/dashboard'),
    ]);

    setEvents(eventData.events);
    setJoinedEventIds(dashboardData.events.map((event) => event.id));
  };

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setErrorMessage('');

    void loadData()
      .catch((error) => {
        if (!cancelled) setErrorMessage(error instanceof Error ? error.message : 'Event ачаалж чадсангүй.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [deferredSearch, statusFilter]);

  const summary = useMemo(() => ({
    total: events.length,
    joined: events.filter((event) => joinedEventIds.includes(event.id)).length,
    upcoming: events.filter((event) => event.status === 'upcoming').length,
  }), [events, joinedEventIds]);

  async function joinEvent(eventId: string) {
    setPendingEventId(eventId);
    setBanner('');
    setErrorMessage('');
    try {
      const data = await apiRequest<{ message?: string; awardedBadges?: Array<{ badge: { icon: string; name: string } }>; gainedXp?: number }>(`/api/events/${eventId}/join`, { method: 'POST' });
      setJoinedEventIds((current) => (current.includes(eventId) ? current : [...current, eventId]));
      setEvents((current) => current.map((event) => event.id === eventId ? { ...event, participantCount: Math.min(EVENT_DEFAULT_CAPACITY, event.participantCount + 1) } : event));
      const badgeMessage = data.awardedBadges?.length ? ` Шинэ badge: ${data.awardedBadges.map((item) => `${item.badge.icon} ${item.badge.name}`).join(', ')}` : '';
      setBanner((data.message || `Амжилттай нэгдлээ. +${data.gainedXp ?? 0} XP`) + badgeMessage);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Event-д нэгдэж чадсангүй.');
    } finally {
      setPendingEventId('');
    }
  }

  async function leaveEvent(eventId: string) {
    setPendingEventId(eventId);
    setBanner('');
    setErrorMessage('');
    try {
      await apiRequest(`/api/events/${eventId}/join`, { method: 'DELETE' });
      setJoinedEventIds((current) => current.filter((id) => id !== eventId));
      setEvents((current) => current.map((event) => event.id === eventId ? { ...event, participantCount: Math.max(0, event.participantCount - 1) } : event));
      setBanner('Event-ээс гарлаа.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Event-ээс гарч чадсангүй.');
    } finally {
      setPendingEventId('');
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#dce7f8] bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#0f1f3d]">Events</h1>
            <p className="mt-1 text-sm text-[#6f86a7]">Нэгдэх, гарах, ойрын арга хэмжээгээ эндээс удирдана.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-[#eef4ff] px-3 py-1 font-semibold text-[#496da8]">Нийт: {summary.total}</span>
            <span className="rounded-full bg-[#edf7ef] px-3 py-1 font-semibold text-[#1f7a42]">Нэгдсэн: {summary.joined}</span>
            <span className="rounded-full bg-[#fff6e8] px-3 py-1 font-semibold text-[#9a5b00]">Удахгүй: {summary.upcoming}</span>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
          <label className="flex items-center gap-2 rounded-[16px] border border-[#d7e4f4] bg-[#f8fbff] px-3 py-2">
            <Search className="h-4 w-4 text-[#6e86a7]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Event хайх"
              className="w-full bg-transparent text-sm text-[#17365f] outline-none placeholder:text-[#93a6c0]"
            />
          </label>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            className="rounded-[16px] border border-[#d7e4f4] bg-[#f8fbff] px-3 py-2 text-sm text-[#17365f] outline-none"
          >
            <option value="all">Бүх төлөв</option>
            <option value="upcoming">Удахгүй</option>
            <option value="ongoing">Явагдаж буй</option>
            <option value="completed">Дууссан</option>
            <option value="cancelled">Цуцлагдсан</option>
          </select>
        </div>

        {(banner || errorMessage) ? (
          <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${errorMessage ? 'border-[#ffd2d5] bg-[#fff7f8] text-[#b23a49]' : 'border-[#c8e6c9] bg-[#f1f8f1] text-[#2e7d32]'}`}>
            {errorMessage || banner}
          </div>
        ) : null}
      </section>

      {isLoading ? (
        <div className="rounded-2xl border border-[#e2eaf5] bg-white p-8 text-sm text-[#6f86a7]">Ачаалж байна...</div>
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          {events.map((event) => {
            const isJoined = joinedEventIds.includes(event.id);
            const isFull = event.participantCount >= EVENT_DEFAULT_CAPACITY;
            const canJoin = !isJoined && !isFull && ['upcoming', 'ongoing'].includes(event.status);

            return (
              <article key={event.id} className="rounded-2xl border border-[#e2eaf5] bg-white p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-[#0f1f3d]">{event.title}</h2>
                <p className="mt-2 text-sm text-[#6f86a7]">{event.description || 'Тайлбар оруулаагүй.'}</p>
                <div className="mt-3 space-y-1 text-xs text-[#6f86a7]">
                  <p className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {event.eventDate}{event.startTime ? ` · ${event.startTime}` : ''}</p>
                  <p className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {event.location || 'Байршилгүй'}</p>
                  <p className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {event.participantCount}/{EVENT_DEFAULT_CAPACITY}</p>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  {isJoined ? (
                    <button
                      type="button"
                      disabled={pendingEventId === event.id}
                      onClick={() => void leaveEvent(event.id)}
                      className="rounded-full border border-[#d7e4f4] px-4 py-2 text-xs font-semibold text-[#4a6080] transition hover:bg-[#eef4ff] disabled:opacity-60"
                    >
                      {pendingEventId === event.id ? 'Гарч байна...' : 'Гарах'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!canJoin || pendingEventId === event.id}
                      onClick={() => void joinEvent(event.id)}
                      className="rounded-full bg-[#1a3560] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {pendingEventId === event.id ? 'Нэгдэж байна...' : isFull ? 'Суудал дүүрсэн' : 'Нэгдэх'}
                    </button>
                  )}
                  <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold text-[#496da8]">{event.status}</span>
                </div>
              </article>
            );
          })}
          {events.length === 0 ? (
            <div className="rounded-2xl border border-[#e2eaf5] bg-white p-8 text-sm text-[#6f86a7]">
              Шүүлтээр event олдсонгүй.
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}
