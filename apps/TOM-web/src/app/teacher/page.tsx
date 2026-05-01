'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';

import { useTomSession } from '@/app/_providers/tom-session-provider';
import type { Club, ClubRequest, TomCurrentUser } from '@/lib/tom-types';

type Summary = {
  pendingRequests: number;
  thresholdReachedRequests: number;
};

type TeacherDashboardResponse = {
  user: TomCurrentUser;
  teacherScopeName: string;
  requests: ClubRequest[];
  clubs: Club[];
  summary: Summary;
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

function startOfWeek(date: Date) {
  const next = new Date(date);
  const offset = (next.getDay() + 6) % 7;
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() - offset);
  return next;
}

function formatIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
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

export default function TeacherDashboard() {
  const { user } = useTomSession();
  const [requests, setRequests] = useState<ClubRequest[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [teacherScopeName, setTeacherScopeName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [, setErrorMessage] = useState('');

  const loadData = async () => {
    const data = await apiRequest<TeacherDashboardResponse>(
      '/api/teacher/dashboard'
    );

    setRequests(data.requests);
    setClubs(data.clubs);
    setTeacherScopeName(data.teacherScopeName);
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
              : 'Багшийн самбарын өгөгдлийг ачаалж чадсангүй.'
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

  const approveRequest = async (requestId: string) => {
    await runAction(async () => {
      await apiRequest<{ request: ClubRequest; club: Club }>(
        `/api/club-requests/${requestId}/approve`,
        { method: 'POST' }
      );
      await loadData();
    }, 'Хүсэлтийг баталж чадсангүй.');
  };

  const rejectRequest = async (requestId: string) => {
    await runAction(async () => {
      await apiRequest<{ request: ClubRequest }>(
        `/api/club-requests/${requestId}/reject`,
        { method: 'POST' }
      );
      await loadData();
    }, 'Хүсэлтийг татгалзаж чадсангүй.');
  };

  const toggleClubStatus = async (club: Club) => {
    const nextStatus = club.status === 'active' ? 'paused' : 'active';

    await runAction(async () => {
      await apiRequest<{ club: Club }>(`/api/clubs/${club.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: club.name,
          description: club.description,
          teacherName: club.teacherName,
          createdBy: club.createdBy,
          interestCount: club.interestCount,
          studentLimit: club.studentLimit,
          memberCount: club.memberCount,
          gradeRange: club.gradeRange,
          allowedDays: club.allowedDays,
          startDate: club.startDate,
          endDate: club.endDate,
          note: club.note,
          status: nextStatus,
          category: club.category,
          verified: club.verified,
        }),
      });
      await loadData();
    }, 'Клубийн төлөв шинэчилж чадсангүй.');
  };

  const activeClubs = useMemo(
    () => clubs.filter((club) => club.status === 'active'),
    [clubs]
  );
  const weeklySchedule = useMemo(() => {
    const weekStart = startOfWeek(new Date());
    const todayIso = formatIsoDate(new Date());

    return WEEK_DAYS.map((day, index) => {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + index);
      const isoDate = formatIsoDate(currentDate);
      const items = activeClubs
        .filter((club) => parseAllowedDays(club.allowedDays).includes(day.key))
        .map((club) => ({
          id: `club-${club.id}-${day.key}`,
          title: club.name,
          meta: club.gradeRange || club.category || 'Клуб',
        }));

      return {
        ...day,
        isoDate,
        dateLabel: formatShortDate(currentDate),
        isToday: isoDate === todayIso,
        items,
      };
    });
  }, [activeClubs]);
  const weeklyItemCount = useMemo(
    () => weeklySchedule.reduce((sum, day) => sum + day.items.length, 0),
    [weeklySchedule]
  );
  const clubStatusLabel = (status: Club['status']) =>
    ({
      active: 'Идэвхтэй',
      paused: 'Түр зогссон',
      pending: 'Хүлээгдэж буй',
      draft: 'Ноорог',
      archived: 'Архивласан',
    }[status] ?? status);

  return (
    <div className="min-h-screen font-sans text-[color:var(--foreground)]">
      <main className="container mx-auto space-y-8 ">
        <section>
          <article className="shadow-soft rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] p-5 text-[color:var(--card-foreground)]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4 text-[#183153]">
                <CalendarDays className="h-5 w-5 text-[#49a0e3]" />
                <div>
                  <h2 className="text-base font-semibold">
                    Энэ долоо хоногийн календарь
                  </h2>
                  <p className="text-sm text-[#6f86a7]">
                    Таны хариуцсан идэвхтэй клубүүдийн 7 хоногийн хуваарь.
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
                  className={`flex min-h-[220px] flex-col rounded-[24px] border py-4 px-2 ${
                    day.isToday
                      ? 'border-[#49a0e3] bg-[#eef5ff]'
                      : 'border-[#dce7f8] bg-[color:var(--surface)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 px-2">
                    <div>
                      <p className="text-sm font-semibold text-[#183153]">
                        {day.label}
                      </p>
                      <p className="text-xs text-[#6f86a7]">{day.dateLabel}</p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-1 flex-col gap-2">
                    {isLoading ? (
                      <p className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-[#c8d8ee] px-3 py-4 text-center text-xs text-[#6f86a7]">
                        Ачаалж байна...
                      </p>
                    ) : day.items.length === 0 ? (
                      <p className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-[#c8d8ee] px-3 py-4 text-center text-xs text-[#6f86a7]">
                        Төлөвлөгөө байхгүй
                      </p>
                    ) : (
                      day.items.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-2xl bg-[#49a0e3] p-2 text-xs text-white"
                        >
                          <p className="font-medium">{item.title}</p>
                          <p className="mt-1 text-white">{item.meta}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section>
          <div className="shadow-soft rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--card-foreground)]">
            <div className="flex flex-row items-center justify-between p-6">
              <div>
                <div className="text-base font-semibold leading-none tracking-tight">
                  Клуб үүсгэх хүсэлтүүд
                </div>
                <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
                  {teacherScopeName ||
                    user?.teacherProfileName ||
                    user?.name ||
                    'Багш'}{' '}
                  нэр дээр ирсэн хүсэлтүүд
                </p>
              </div>
              <div className="rounded-full border border-transparent bg-[color:var(--secondary)] px-2.5 py-0.5 text-xs font-semibold text-[color:var(--secondary-foreground)]">
                {requests.length} хүлээгдэж байна
              </div>
            </div>
            <div className="space-y-3 p-6 pt-0">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between rounded-2xl border border-[color:var(--border)] p-4 transition-colors hover:bg-[color:var(--muted)]/50"
                >
                  <div>
                    <p className="font-medium">{request.clubName}</p>
                    <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
                      {request.createdBy} · {request.startDate || 'Огноо алга'}{' '}
                      · {request.interestCount} сонирхсон
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={isSaving}
                      onClick={() =>
                        void rejectRequest(request.id)
                      }
                      className="inline-flex h-8 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[color:var(--input)] bg-[color:var(--background)] px-3 text-xs font-medium shadow-sm transition-colors hover:bg-[color:var(--accent)] hover:text-[color:var(--accent-foreground)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Татгалзах
                    </button>
                    <button
                      disabled={isSaving}
                      onClick={() =>
                        void approveRequest(request.id)
                      }
                      className="inline-flex h-8 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#49a0e3] px-3 text-xs font-medium text-white shadow transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Зөвшөөрөх
                    </button>
                  </div>
                </div>
              ))}
              {requests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[color:var(--border)] p-5 text-sm text-[color:var(--muted-foreground)]">
                  Одоогоор хүлээгдэж буй хүсэлт алга байна.
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <div className="shadow-soft rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--card-foreground)]">
          <div className="p-6">
            <div className="text-base font-semibold leading-none tracking-tight">
              Миний хариуцсан клубүүд
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-[color:var(--muted)]/50">
                    <th className="h-10 px-2 text-left align-middle font-medium text-[color:var(--muted-foreground)]">
                      Клуб
                    </th>
                    <th className="h-10 px-2 text-left align-middle font-medium text-[color:var(--muted-foreground)]">
                      Гишүүд
                    </th>
                    <th className="h-10 px-2 text-left align-middle font-medium text-[color:var(--muted-foreground)]">
                      Төлөв
                    </th>
                    <th className="h-10 px-2 text-left align-middle font-medium text-[color:var(--muted-foreground)]">
                      Баталгаажсан
                    </th>
                    <th className="h-10 px-2 text-right align-middle font-medium text-[color:var(--muted-foreground)]">
                      Үйлдэл
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {clubs.map((club) => (
                    <tr
                      key={club.id}
                      className="border-b transition-colors hover:bg-[color:var(--muted)]/50"
                    >
                      <td className="p-2 align-middle font-medium">
                        {club.name}
                      </td>
                      <td className="p-2 align-middle">{club.memberCount}</td>
                      <td className="p-2 align-middle">
                        <div
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            club.status === 'active'
                              ? 'bg-[color:var(--success)]/15 text-[color:var(--success)]'
                              : 'bg-[color:var(--warning)]/20 text-[color:var(--warning-foreground)]'
                          }`}
                        >
                          {clubStatusLabel(club.status)}
                        </div>
                      </td>
                      <td className="p-2 align-middle">
                        {club.verified ? (
                          <div className="inline-flex items-center rounded-full border-0 bg-[color:var(--primary-soft)] px-2.5 py-0.5 text-xs font-semibold text-[color:var(--primary)]">
                            <ShieldCheck className="mr-1 h-3 w-3" /> Тийм
                          </div>
                        ) : (
                          <span className="text-xs text-[color:var(--muted-foreground)]">
                            —
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-right align-middle">
                        <button
                          disabled={isSaving}
                          onClick={() => void toggleClubStatus(club)}
                          className="inline-flex h-8 items-center justify-center rounded-full px-3 text-xs font-medium transition-colors hover:bg-[color:var(--accent)] hover:text-[color:var(--accent-foreground)] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {club.status === 'active'
                            ? 'Түр зогсоох'
                            : 'Идэвхжүүлэх'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
