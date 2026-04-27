'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Plus,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

import type { Club, ClubRequest } from '@/lib/tom-types';

type Summary = {
  totalUsers: number;
  activeClubs: number;
  pendingRequests: number;
  spamRequests: number;
  thresholdReachedRequests: number;
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

export default function TeacherDashboard() {
  const [requests, setRequests] = useState<ClubRequest[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalUsers: 0,
    activeClubs: 0,
    pendingRequests: 0,
    spamRequests: 0,
    thresholdReachedRequests: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(
    'Багшийн самбарын шууд өгөгдөлд холбогдлоо.'
  );
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = async (nextMessage?: string) => {
    const [summaryData, requestData, clubData] = await Promise.all([
      apiRequest<{ summary: Summary }>('/api/dashboard/summary'),
      apiRequest<{ requests: ClubRequest[] }>(
        '/api/club-requests?requestStatus=pending'
      ),
      apiRequest<{ clubs: Club[] }>('/api/clubs'),
    ]);

    setSummary(summaryData.summary);
    setRequests(requestData.requests);
    setClubs(clubData.clubs);
    setMessage(nextMessage || 'Багшийн самбарын шууд өгөгдөлд холбогдлоо.');
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

  const approveRequest = async (requestId: string, name: string) => {
    await runAction(async () => {
      await apiRequest<{ request: ClubRequest; club: Club }>(
        `/api/club-requests/${requestId}/approve`,
        { method: 'POST' }
      );
      await loadData(`${name} хүсэлт батлагдаж клуб болсон.`);
    }, 'Хүсэлтийг баталж чадсангүй.');
  };

  const rejectRequest = async (requestId: string, name: string) => {
    await runAction(async () => {
      await apiRequest<{ request: ClubRequest }>(
        `/api/club-requests/${requestId}/reject`,
        { method: 'POST' }
      );
      await loadData(`${name} хүсэлт татгалзагдлаа.`);
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
      await loadData(
        nextStatus === 'active'
          ? `${club.name} дахин идэвхжлээ.`
          : `${club.name} түр зогссон төлөвт орлоо.`
      );
    }, 'Клубийн төлөв шинэчилж чадсангүй.');
  };

  const inactiveCount = clubs.filter((club) => club.status !== 'active').length;
  const clubStatusLabel = (status: Club['status']) =>
    ({
      active: 'Идэвхтэй',
      paused: 'Түр зогссон',
      pending: 'Хүлээгдэж буй',
      draft: 'Ноорог',
      archived: 'Архивласан',
      spam: 'Спам',
    })[status] ?? status;

  const stats = useMemo(
    () => [
      {
        label: 'Хүлээгдэж буй хүсэлт',
        value: summary.pendingRequests,
        icon: ClipboardList,
        accent: 'bg-gradient-teacher',
      },
      {
        label: 'Миний клубүүд',
        value: clubs.length,
        icon: ShieldCheck,
        accent: 'bg-gradient-primary',
      },
      {
        label: 'Идэвхгүй клубүүд',
        value: inactiveCount,
        icon: AlertCircle,
        accent: 'bg-gradient-admin',
      },
      {
        label: 'Босго хангасан',
        value: summary.thresholdReachedRequests,
        icon: Calendar,
        accent: 'bg-gradient-student',
      },
    ],
    [
      clubs.length,
      inactiveCount,
      summary.pendingRequests,
      summary.thresholdReachedRequests,
    ]
  );

  return (
    <div className="min-h-screen font-sans text-[color:var(--foreground)]">
      <main className="container mx-auto space-y-8 ">
        <section
          className={`shadow-soft rounded-3xl border px-5 py-4 ${
            errorMessage
              ? 'border-[#ffd2d5] bg-[#fff7f8] text-[#b23a49]'
              : 'border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--muted-foreground)]'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                {errorMessage
                  ? 'Синк алдаа'
                  : isLoading
                  ? 'Шууд өгөгдөл ачаалж байна'
                  : isSaving
                  ? 'Өөрчлөлт хадгалж байна'
                  : 'Холбогдсон'}
              </p>
              <p className="mt-1 text-sm">
                {errorMessage ||
                  (isLoading
                    ? 'Cloudflare D1 дээрх хүсэлт, клуб, статистик өгөгдлийг ачаалж байна.'
                    : isSaving
                    ? 'Сүүлд хийсэн багшийн үйлдлийг хадгалж байна.'
                    : message)}
              </p>
            </div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-medium text-[color:var(--primary-foreground)] shadow transition-colors hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Админы хэрэгсэл нээх
            </Link>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="shadow-soft rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--card-foreground)]"
              >
                <div className="flex items-center gap-4 p-5">
                  <div
                    className={`shadow-soft flex h-12 w-12 items-center justify-center rounded-2xl ${stat.accent}`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{stat.value}</p>
                    <p className="text-xs text-[color:var(--muted-foreground)]">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="shadow-soft lg:col-span-2 rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--card-foreground)]">
            <div className="flex flex-row items-center justify-between p-6">
              <div className="text-base font-semibold leading-none tracking-tight">
                Клуб үүсгэх хүсэлтүүд
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
                      {request.createdBy} · {request.startDate || 'Огноо алга'} ·{' '}
                      {request.interestCount} сонирхсон
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={isSaving}
                      onClick={() =>
                        void rejectRequest(request.id, request.clubName)
                      }
                      className="inline-flex h-8 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[color:var(--input)] bg-[color:var(--background)] px-3 text-xs font-medium shadow-sm transition-colors hover:bg-[color:var(--accent)] hover:text-[color:var(--accent-foreground)] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Татгалзах
                    </button>
                    <button
                      disabled={isSaving}
                      onClick={() =>
                        void approveRequest(request.id, request.clubName)
                      }
                      className="inline-flex h-8 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[color:var(--primary)] px-3 text-xs font-medium text-[color:var(--primary-foreground)] shadow transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Батлах
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

          <div className="shadow-soft rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--card-foreground)]">
            <div className="p-6">
              <div className="text-base font-semibold leading-none tracking-tight">
                Түргэн үйлдлүүд
              </div>
            </div>
            <div className="space-y-3 p-6 pt-0">
              <Link
                href="/admin"
                className="inline-flex w-full items-center justify-start gap-2 rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-medium text-[color:var(--primary-foreground)] shadow transition-colors hover:opacity-90"
              >
                <Plus className="h-4 w-4" /> Шинэ клуб үүсгэх
              </Link>
              <button
                disabled
                className="inline-flex w-full items-center justify-start gap-2 rounded-full border border-[color:var(--input)] bg-[color:var(--background)] px-4 py-2 text-sm font-medium shadow-sm opacity-60"
              >
                <Calendar className="h-4 w-4" /> Арга хэмжээ нийтлэх
              </button>
              <button
                disabled
                className="inline-flex w-full items-center justify-start gap-2 rounded-full border border-[color:var(--input)] bg-[color:var(--background)] px-4 py-2 text-sm font-medium shadow-sm opacity-60"
              >
                <ShieldCheck className="h-4 w-4" /> Клуб баталгаажуулах
              </button>
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
                          {club.status === 'active' ? 'Түр зогсоох' : 'Идэвхжүүлэх'}
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
