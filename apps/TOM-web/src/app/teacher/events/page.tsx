'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, MapPin, Plus, Trash2 } from 'lucide-react';

import { StatusBadge } from '@/app/_components';
import { useTomSession } from '@/app/_providers/tom-session-provider';
import type { EventStatus, SchoolEvent, TomCurrentUser } from '@/lib/tom-types';

const eventStatuses: EventStatus[] = [
  'upcoming',
  'ongoing',
  'completed',
  'cancelled',
];
const eventStatusLabel: Record<EventStatus, string> = {
  upcoming: 'Удахгүй',
  ongoing: 'Явагдаж буй',
  completed: 'Дууссан',
  cancelled: 'Цуцлагдсан',
};

type EventForm = {
  title: string;
  description: string;
  location: string;
  eventDate: string;
  startTime: string;
  endTime: string;
};

const emptyForm: EventForm = {
  title: '',
  description: '',
  location: '',
  eventDate: '',
  startTime: '',
  endTime: '',
};

type TeacherEventsResponse = {
  user: TomCurrentUser;
  teacherScopeName: string;
  events: SchoolEvent[];
};

async function readJson<T>(response: Response) {
  const data = (await response.json().catch(() => null)) as
    | ({ error?: string } & T)
    | null;

  if (!response.ok) {
    throw new Error(
      data?.error || `Request failed with status ${response.status}.`
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

export default function EventsPage() {
  const { user } = useTomSession();
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [teacherScopeName, setTeacherScopeName] = useState('');
  const [, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [, setErrorMessage] = useState('');

  const loadData = async () => {
    const eventData = await apiRequest<TeacherEventsResponse>(
      '/api/teacher/events'
    );

    setEvents(eventData.events);
    setTeacherScopeName(eventData.teacherScopeName);
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        await loadData();
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Багшийн арга хэмжээний хуудсыг ачаалж чадсангүй.'
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

  const runAction = async (action: () => Promise<void>, fallback: string) => {
    setIsSaving(true);
    setErrorMessage('');

    try {
      await action();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : fallback);
    } finally {
      setIsSaving(false);
    }
  };

  const createEvent = async () => {
    await runAction(async () => {
      await apiRequest('/api/teacher/events', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm(emptyForm);
      await loadData();
    }, 'Арга хэмжээ үүсгэж чадсангүй.');
  };

  const updateEventStatus = async (event: SchoolEvent, status: EventStatus) => {
    await runAction(async () => {
      await apiRequest(`/api/events/${event.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await loadData();
    }, 'Арга хэмжээний төлөв шинэчилж чадсангүй.');
  };

  const deleteEvent = async (event: SchoolEvent) => {
    await runAction(async () => {
      await apiRequest(`/api/events/${event.id}`, {
        method: 'DELETE',
      });
      await loadData();
    }, 'Арга хэмжээ устгаж чадсангүй.');
  };

  const summary = useMemo(
    () => ({
      total: events.length,
      live: events.filter((event) => event.status === 'ongoing').length,
      upcoming: events.filter((event) => event.status === 'upcoming').length,
      attendance: events.reduce(
        (sum, event) => sum + event.participantCount,
        0
      ),
    }),
    [events]
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Нийт арга хэмжээ', value: summary.total },
          { label: 'Удахгүй болох', value: summary.upcoming },
          { label: 'Одоо явагдаж буй', value: summary.live },
          { label: 'Нийт оролцогч', value: summary.attendance },
        ].map((item) => (
          <article
            key={item.label}
            className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-soft"
          >
            <p className="text-sm font-semibold text-[#5f7697]">{item.label}</p>
            <p className="mt-3 text-3xl font-bold text-[#17304f]">
              {item.value}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_1.5fr]">
        <article className="rounded-[32px] border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <Plus className="h-5 w-5 text-[#49a0e3]" />
            <div>
              <h2 className="text-xl font-semibold text-[#17304f]">
                Арга хэмжээ үүсгэх
              </h2>
              <p className="mt-1 text-sm text-[#6e84a3]">
                {teacherScopeName ||
                  user?.teacherProfileName ||
                  user?.name ||
                  'Багш'}{' '}
                нэр дээр шууд шинэ арга хэмжээ нэмнэ.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4">
            <input
              value={form.title}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
              placeholder="Арга хэмжээний нэр"
              className="rounded-2xl border border-[#d8e4f4] bg-white px-4 py-3 text-sm outline-none focus:border-[#88a9df]"
            />
            <textarea
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              placeholder="Тайлбар"
              rows={4}
              className="rounded-2xl border border-[#d8e4f4] bg-white px-4 py-3 text-sm outline-none focus:border-[#88a9df]"
            />
            <div className="grid gap-4 md:grid-cols-2">
              <input
                value={form.location}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    location: event.target.value,
                  }))
                }
                placeholder="Байршил"
                className="rounded-2xl border border-[#d8e4f4] bg-white px-4 py-3 text-sm outline-none focus:border-[#88a9df]"
              />
              <div className="flex items-center rounded-2xl border border-[#d8e4f4] bg-[#f6f9ff] px-4 py-3 text-sm font-semibold text-[#5c7395]">
                Үүсгэх нэр:{' '}
                {teacherScopeName ||
                  user?.teacherProfileName ||
                  user?.name ||
                  'Багш'}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <input
                type="date"
                value={form.eventDate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    eventDate: event.target.value,
                  }))
                }
                className="rounded-2xl border border-[#d8e4f4] bg-white px-4 py-3 text-sm outline-none focus:border-[#88a9df]"
              />
              <input
                type="time"
                value={form.startTime}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    startTime: event.target.value,
                  }))
                }
                className="rounded-2xl border border-[#d8e4f4] bg-white px-4 py-3 text-sm outline-none focus:border-[#88a9df]"
              />
              <input
                type="time"
                value={form.endTime}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    endTime: event.target.value,
                  }))
                }
                className="rounded-2xl border border-[#d8e4f4] bg-white px-4 py-3 text-sm outline-none focus:border-[#88a9df]"
              />
            </div>

            <button
              type="button"
              onClick={() => void createEvent()}
              disabled={isSaving || !form.title.trim() || !form.eventDate}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#49a0e3] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Арга хэмжээ үүсгэх
            </button>
          </div>
        </article>

        <article className="rounded-[32px] border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-5 w-5 text-[#49a0e3]" />
            <div>
              <h2 className="text-xl font-semibold text-[#17304f]">
                Арга хэмжээний хуваарь
              </h2>
              <p className="mt-1 text-sm text-[#6e84a3]">
                Багшийн талаас арга хэмжээний явц, төлөв, оролцоог удирдана.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {events.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#d6e1ef] px-4 py-10 text-center text-sm text-[#7d93b2]">
                Арга хэмжээ олдсонгүй.
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="rounded-[24px] border border-[#deebf7] bg-white/90 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-[#17304f]">
                          {event.title}
                        </h3>
                        <StatusBadge
                          type={
                            event.status === 'cancelled'
                              ? 'rejected'
                              : event.status
                          }
                          text={eventStatusLabel[event.status]}
                        />
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-[#6e84a3]">
                        <span>{event.eventDate}</span>
                        <span>
                          {event.startTime || '--:--'} -{' '}
                          {event.endTime || '--:--'}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.location || 'Байршил тодорхойгүй'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void deleteEvent(event)}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 rounded-full border border-[#ffd7da] px-4 py-2 text-sm font-semibold text-[#b84553] transition hover:bg-[#fff3f4] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Устгах
                    </button>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-[#526987]">
                    {event.description ||
                      'Энэ арга хэмжээнд тайлбар хараахан ороогүй.'}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                    <Link
                      href={`/teacher/events/${event.id}`}
                      className="rounded-full border border-[#d8e4f4] bg-white px-3 py-2 font-semibold text-[#17304f] transition hover:bg-[#eef4ff]"
                    >
                      Постууд
                    </Link>
                    {eventStatuses.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => void updateEventStatus(event, status)}
                        disabled={isSaving || event.status === status}
                        className={`rounded-full px-3 py-2 font-semibold transition ${
                          event.status === status
                            ? 'bg-[#49a0e3] text-white'
                            : 'border border-[#d8e4f4] text-[#17304f] hover:bg-[#eef4ff]'
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        {eventStatusLabel[status]}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 rounded-2xl bg-[#f4f8fd] px-4 py-3 text-sm text-[#5f7697]">
                    <span className="font-semibold text-[#17304f]">
                      {event.participantCount}
                    </span>{' '}
                    оролцогч бүртгүүлсэн · үүсгэсэн: {event.createdBy}
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
