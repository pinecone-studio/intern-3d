'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  ChevronRight,
  Heart,
  PlusCircle,
  Sparkles,
  Star,
  Swords,
  Trophy,
  Users,
} from 'lucide-react';

import type { Club, ClubRequest } from '@/lib/tom-types';

const tabs = ['Үзэх', 'Урсгал', 'Арга хэмжээ', 'Үүсгэх'];

const badges = [
  {
    name: 'Анхны клуб',
    description: 'Анхны нийгэмлэгтээ нэгдлээ',
    icon: Star,
    color: 'from-[#8db8ff] to-[#7aa8f4]',
  },
  {
    name: 'Арга хэмжээний баатар',
    description: '5 арга хэмжээнд оролцлоо',
    icon: CalendarDays,
    color: 'from-[#6ad0dc] to-[#63bfd8]',
  },
  {
    name: 'Шилдэг санал өгөгч',
    description: 'Клубын шийдвэрийг дэмжсэн',
    icon: Heart,
    color: 'from-[#7898ef] to-[#6388e7]',
  },
  {
    name: 'Тогтмол оролцогч',
    description: 'Долоо хоног бүр идэвхтэй',
    icon: Sparkles,
    color: 'from-[#73c7e9] to-[#62afd8]',
  },
];

const badgeRail = [...badges, ...badges];

const quickActions = [
  {
    title: 'Шинэ клуб нээх',
    description: 'Санаа, зөвлөх багш, зорилготойгоо хамт клубын саналаа илгээнэ үү.',
    icon: PlusCircle,
    accent: 'bg-[#e9f5ff] text-[#3f7ad8]',
    cta: 'Хүсэлт илгээх',
    href: '/students/create-club',
  },

  {
    title: 'Арга хэмжээнд оролцох',
    description:
      'Энэ долоо хоногийн воркшоп, тоглоомын үдэш, клубын уулзалтад бүртгүүлээрэй.',
    icon: CalendarDays,
    accent: 'bg-[#eef1ff] text-[#5f79d8]',
    cta: 'Арга хэмжээ үзэх',
    href: '/students/events',
  },
];

const clubGradients = [
  'from-[#79b8f4] to-[#b0befc]',
  'from-[#69c8d7] to-[#84c6ef]',
  'from-[#658be1] to-[#7882db]',
  'from-[#71b8f1] to-[#88caef]',
];

async function readJson<T>(response: Response) {
  const data = (await response.json().catch(() => null)) as
    | ({ error?: string } & T)
    | null;

  if (!response.ok) {
    throw new Error(
      data?.error ||
        `Хүсэлт амжилтгүй боллоо (код: ${response.status}).`
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

export default function StudentDashboard() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [requests, setRequests] = useState<ClubRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(
    'Сурагчийн хяналтын самбар клубүүдийн мэдээллийг харуулж байна.'
  );
  const [errorMessage, setErrorMessage] = useState('');

  const xpCurrent = 740;
  const xpGoal = 1000;
  const progress = (xpCurrent / xpGoal) * 100;

  const loadData = async (nextMessage?: string) => {
    const [clubData, requestData] = await Promise.all([
      apiRequest<{ clubs: Club[] }>('/api/clubs'),
      apiRequest<{ requests: ClubRequest[] }>(
        '/api/club-requests?requestStatus=pending'
      ),
    ]);

    setClubs(clubData.clubs);
    setRequests(requestData.requests);
    setMessage(
      nextMessage ||
        'Сурагчийн хяналтын самбар клубүүдийн мэдээллийг харуулж байна.'
    );
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
              : 'Сурагчийн хяналтын самбарын өгөгдлийг ачаалж чадсангүй.'
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

  const updateClubMetrics = async (
    club: Club,
    changes: { memberCount?: number; interestCount?: number },
    nextMessage: string
  ) => {
    await runAction(async () => {
      await apiRequest<{ club: Club }>(`/api/clubs/${club.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: club.name,
          description: club.description,
          teacherName: club.teacherName,
          createdBy: club.createdBy,
          interestCount: changes.interestCount ?? club.interestCount,
          studentLimit: club.studentLimit,
          memberCount: changes.memberCount ?? club.memberCount,
          gradeRange: club.gradeRange,
          allowedDays: club.allowedDays,
          startDate: club.startDate,
          endDate: club.endDate,
          note: club.note,
          status: club.status,
          category: club.category,
          verified: club.verified,
        }),
      });

      await loadData(nextMessage);
    }, 'Клубийн өгөгдлийг шинэчилж чадсангүй.');
  };

  const interestInClub = async (club: Club) => {
    await updateClubMetrics(
      club,
      { interestCount: club.interestCount + 1 },
      `${club.name} клубт сонирхол илэрхийллээ.`
    );
  };

  const joinClub = async (club: Club) => {
    await updateClubMetrics(
      club,
      {
        interestCount: club.interestCount + 1,
        memberCount: Math.min(club.studentLimit, club.memberCount + 1),
      },
      `${club.name} клубын гишүүнчлэлийн тоо шинэчлэгдлээ.`
    );
  };

  const featuredClubs = useMemo(
    () =>
      clubs.slice(0, 4).map((club, index) => ({
        ...club,
        gradient: clubGradients[index % clubGradients.length],
      })),
    [clubs]
  );

  const activityItems = useMemo(() => {
    const nextRequest = requests[0];
    const activeClub = clubs.find((club) => club.status === 'active');
    const biggestClub = [...clubs].sort(
      (a, b) => b.memberCount - a.memberCount
    )[0];

    return [
      nextRequest
        ? {
            title: 'Клуб нээх хүсэлт',
            detail: `${nextRequest.clubName} хүсэлтэд ${nextRequest.interestCount} сонирхол бүртгэгдсэн байна.`,
          }
        : {
            title: 'Клуб нээх хүсэлт',
            detail: 'Одоогоор хүлээгдэж буй хүсэлт алга байна.',
          },
      activeClub
        ? {
            title: `${activeClub.name} одоо идэвхтэй`,
            detail: `${activeClub.teacherName} удирдаж байна. ${activeClub.memberCount} гишүүнтэй.`,
          }
        : {
            title: 'Идэвхтэй клубын мэдээлэл',
            detail: 'Идэвхтэй клуб одоогоор алга байна.',
          },
      biggestClub
        ? {
            title: 'Хамгийн идэвхтэй клуб',
            detail: `${biggestClub.name} хамгийн олон ${biggestClub.memberCount} гишүүнтэй байна.`,
          }
        : {
            title: 'Хамгийн идэвхтэй клуб',
            detail: 'Клубийн өгөгдөл одоогоор хоосон байна.',
          },
    ];
  }, [clubs, requests]);

  return (
    <main className="min-h-screen ">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="dashboard-entrance overflow-hidden rounded-[34px]">
          <div className="relative overflow-hidden">
            <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1fr)_15rem]">
              <section className="dashboard-entrance dashboard-entrance-delay-1 min-w-0 rounded-[30px] bg-blue-950 p-6 text-white  sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-white/80">
                      Дахин тавтай морил, Tselmeg
                    </p>
                    <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-[2rem]">
                      Түвшин 7 · Клуб судлаач
                    </h1>
                  </div>
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-3">
                    <Trophy className="h-8 w-8 text-white/95" />
                  </div>
                </div>

                <div className="mt-8">
                  <div className="mb-2 flex items-center justify-between text-sm font-medium text-white/85">
                    <span>{xpCurrent} XP</span>
                    <span>{xpGoal} XP</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/30">
                    <div
                      className="h-full rounded-full bg-white "
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm text-white/85">
                    8-р түвшин хүртэл 260 XP
                  </p>
                </div>
              </section>

              <aside className="dashboard-entrance dashboard-entrance-delay-2 w-60 shrink-0 rounded-[30px] border border-[#dbe7f8] bg-white/95 p-6 ">
                <div className="flex items-center gap-2 text-[#1d355b]">
                  <Trophy className="h-5 w-5 text-blue-950" />
                  <h2 className="text-lg font-semibold">Тэмдгүүд</h2>
                </div>

                <div className="badge-marquee mt-6">
                  <div className="badge-marquee-track">
                    {badgeRail.map((badge, index) => {
                      const Icon = badge.icon;

                      return (
                        <article
                          key={`${badge.name}-${index}`}
                          className="badge-marquee-item flex min-w-[148px] flex-col items-center rounded-2xl bg-[#fbfdff] px-3 py-3 text-center"
                        >
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${badge.color} text-white `}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <p className="mt-3 text-sm font-semibold text-[#294262]">
                            {badge.name}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-[#8398b4]">
                            {badge.description}
                          </p>
                        </article>
                      );
                    })}
                  </div>
                </div>
              </aside>
            </div>

            <section className="dashboard-entrance dashboard-entrance-delay-3 mt-6 rounded-[28px] border border-[#dce7f8] bg-white/90 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6f86a7]">
                    {errorMessage
                      ? 'Синхрончлолын алдаа'
                      : isLoading
                      ? 'Шууд өгөгдөл ачаалж байна'
                      : isSaving
                      ? 'Өөрчлөлт хадгалж байна'
                      : 'Холбогдсон'}
                  </p>
                  <p className="mt-1 text-sm text-[#58708f]">
                    {errorMessage ||
                      (isLoading
                        ? 'Cloudflare D1 дээрх клуб, хүсэлтийн өгөгдлийг сурагчийн хуудсанд ачаалж байна.'
                        : isSaving
                        ? 'Клуб дээр хийсэн сурагчийн үйлдлийг хадгалж байна.'
                        : message)}
                  </p>
                </div>
                <div className="rounded-full bg-[#eef5ff] px-4 py-2 text-sm font-semibold text-[#4f6b8d]">
                  Нийт {clubs.length} клуб
                </div>
              </div>
            </section>

            <section className="dashboard-entrance dashboard-entrance-delay-3 mt-6 grid gap-4 lg:grid-cols-3">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <article
                    key={action.title}
                    className="rounded-[26px] border border-[#dbe8f9] bg-white/90 p-5"
                  >
                    <div
                      className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${action.accent}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-[#20395d]">
                      {action.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#6f86a6]">
                      {action.description}
                    </p>
                    {action.href ? (
                      <Link
                        href={action.href}
                        className="mt-5 inline-flex items-center gap-2 rounded-full bg-blue-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#13284a]"
                      >
                        {action.cta}
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="mt-5 inline-flex items-center gap-2 rounded-full bg-blue-950 px-4 py-2 text-sm font-semibold text-white opacity-70"
                      >
                        {action.cta}
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </article>
                );
              })}{' '}
              <section className="rounded-[28px] border border-[#dce7f8] bg-[linear-gradient(180deg,#f6fbff_0%,#ffffff_100%)] p-5 ">
                <div className="flex items-center gap-2">
                  <Swords className="h-5 w-5 text-[#6f8fe3]" />
                  <h3 className="text-lg font-semibold text-[#223b5f]">
                    Үйл ажиллагааны даалгавар
                  </h3>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl bg-[#eef6ff] p-4">
                    <p className="text-sm font-semibold text-[#224064]">
                      Клубт сонирхол илэрхийлэх
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#eefcfb] p-4">
                    <p className="text-sm font-semibold text-[#224064]">
                      Идэвхтэй нийгэмлэгт нэгдэх
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#f2f1ff] p-4">
                    <p className="text-sm font-semibold text-[#224064]">
                      Хүлээгдэж буй клубын санааг хянах
                    </p>
                  </div>
                </div>
              </section>
            </section>
          </div>
        </section>

        <section className="dashboard-entrance dashboard-entrance-delay-4 rounded-[34px] border border-[#d8e6f8] bg-white px-5 py-6  sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7c92b0]">
                Сурагчийн орон зай
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[#183255] sm:text-3xl">
                Клубүүдийг үзэж, нийгэмлэгт нэгдэж, идэвхтэй байгаарай
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#7086a5] sm:text-base">
                TOM-ийн өгөгдлийн сан дахь клубүүдийг нээж үзээд, сонирхлын
                түвшинг дагаж, гишүүнчлэлийн өөрчлөлтийг энэ хуудсаас шууд
                шинэчлээрэй.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {tabs.map((tab, index) => (
                <button
                  key={tab}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    index === 0
                      ? 'bg-white text-[#234064] ring-1 ring-[#d6e3f7]'
                      : 'text-[#7a90af] hover:bg-[#f3f8ff]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-[1.5fr_0.7fr]">
            <div className="grid gap-5 md:grid-cols-2">
              {featuredClubs.map((club, index) => (
                <article
                  key={club.id}
                  className={`rounded-[28px] border border-[#dce8f8] bg-white  dashboard-entrance ${
                    index === 1
                      ? 'dashboard-entrance-delay-1'
                      : index === 2
                      ? 'dashboard-entrance-delay-2'
                      : index === 3
                      ? 'dashboard-entrance-delay-3'
                      : ''
                  }`}
                >
                  <div
                    className={`rounded-t-[28px] bg-gradient-to-r ${club.gradient} px-5 py-4 text-white`}
                  >
                    <div className="flex justify-end">
                      {club.verified ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#5c8bd9]">
                          <Sparkles className="h-3.5 w-3.5" />
                          Баталгаажсан
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white/90">
                          Шинэ клуб
                        </span>
                      )}
                    </div>
                    <div className="mt-10 h-10" />
                  </div>

                  <div className="px-5 py-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-2xl font-semibold text-[#1d355b]">
                          {club.name}
                        </h3>
                        <div className="mt-2 flex items-center gap-2 text-sm text-[#7f94b0]">
                          <Users className="h-4 w-4" />
                          <span>{club.memberCount} гишүүн</span>
                        </div>
                        <p className="mt-2 text-xs text-[#7f94b0]">
                          Сонирхол {club.interestCount} · {club.teacherName}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#eef5ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#5c7ea5]">
                        {club.category}
                      </span>
                    </div>

                    <div className="mt-6 flex gap-3">
                      <button
                        disabled={isSaving}
                        onClick={() => void interestInClub(club)}
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#d6e1f2] px-4 py-2.5 text-sm font-semibold text-[#4f6587] transition hover:bg-[#f6f9ff] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Heart className="h-4 w-4" />
                        Сонирхох
                      </button>
                      <button
                        disabled={isSaving}
                        onClick={() => void joinClub(club)}
                        className="inline-flex flex-1 items-center justify-center rounded-full bg-[#67a2ea] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#568fd8] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Нэгдэх
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <aside className="space-y-5">
              <section className="rounded-[28px] border border-[#dce7f8] bg-white p-5 ">
                <h3 className="text-lg font-semibold text-[#223b5f]">
                  Шууд идэвхжил
                </h3>
                <div className="mt-4 space-y-3">
                  {activityItems.map((item) => (
                    <article
                      key={item.title}
                      className="rounded-2xl border border-[#e7eef8] bg-[#fbfdff] p-4"
                    >
                      <p className="text-sm font-semibold text-[#243f63]">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#7c91ad]">
                        {item.detail}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
