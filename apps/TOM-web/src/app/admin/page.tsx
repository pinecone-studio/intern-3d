'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BadgeAlert,
  CalendarDays,
  ChartColumnIncreasing,
  Plus,
  Sparkles,
  ShieldCheck,
  Trophy,
  Users,
  X,
} from 'lucide-react';

import { CapacityBar, StatusBadge } from '@/app/_components';
import { useTomOptions } from '@/app/_hooks/useTomOptions';
import { userRoleOptions } from './admin-data';
import { useAdminDashboard } from './useAdminDashboard';

export type AdminSection = 'requests' | 'users' | 'clubs' | 'events';

const fieldClass =
  'w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--text)] outline-none transition placeholder:text-[#8aa0be] focus:border-[color:var(--primary)] focus:bg-white focus:ring-2 focus:ring-[color:var(--primary-soft)]';

const panelClass =
  'rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-4 shadow-sm backdrop-blur';

const inputLabelClass = 'mb-1.5 block text-xs font-semibold text-[#5f7697]';

const weekDays = [
  { key: 1, label: 'Даваа' },
  { key: 2, label: 'Мягмар' },
  { key: 3, label: 'Лхагва' },
  { key: 4, label: 'Пүрэв' },
  { key: 5, label: 'Баасан' },
  { key: 6, label: 'Бямба' },
  { key: 0, label: 'Ням' },
] as const;

const dayNameToIndex: Record<string, number> = {
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
    .map((item) => dayNameToIndex[item])
    .filter((item): item is number => item !== undefined);
}

export function AdminDashboardContent({
  activeSection,
}: {
  activeSection: AdminSection | null;
}) {
  const { options } = useTomOptions();
  const {
    activeClubs,
    approveRequest,
    canCreateEvent,
    events,
    eventForm,
    eventFormError,
    handleCancelEvent,
    handleCreateEvent,
    handleCreateUser,
    handleDeleteEvent,
    handleToggleEventStatus,
    isSaving,
    leaderboard: dashboardLeaderboard,
    pendingRequests,
    rejectRequest,
    requests,
    resetEventForm,
    resetUserForm,
    thresholdGoal,
    toggleClubStatus,
    toggleUserBan,
    toggleUserRestriction,
    updateEventField,
    updateUserField,
    updateUserRole,
    formatThresholdLabel,
    summary,
    userForm,
    users,
  } = useAdminDashboard(options);

  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);

  const openEventDialog = () => setIsEventDialogOpen(true);
  const closeEventDialog = () => {
    setIsEventDialogOpen(false);
    resetEventForm();
  };

  const safeUsers = Array.isArray(users) ? users : [];
  const leaderboardSource =
    Array.isArray(dashboardLeaderboard) && dashboardLeaderboard.length > 0
      ? dashboardLeaderboard
      : safeUsers;
  const leaderboard = [...leaderboardSource]
    .sort((left, right) => {
      const rightClubCount = Number(right.clubCount ?? 0);
      const leftClubCount = Number(left.clubCount ?? 0);

      if (rightClubCount !== leftClubCount) {
        return rightClubCount - leftClubCount;
      }

      return (left.name ?? '').localeCompare(right.name ?? '');
    })
    .slice(0, 5)
    .map((user, index) => ({
      ...user,
      rank: index + 1,
      points:
        'points' in user && typeof user.points === 'number'
          ? user.points
          : 3200 +
            Number(user.clubCount ?? 0) * 410 +
            (user.role === 'teacher' ? 220 : 0) +
            (user.accountStatus === 'active' ? 160 : 0),
    }));

  const spotlightClubs = requests.slice(0, 3);
  const spotlightUsers = leaderboard.slice(0, 3);
  const activeClubStatusCount = activeClubs.filter(
    (club) => club.clubStatus === 'active'
  ).length;
  const pausedClubStatusCount = activeClubs.length - activeClubStatusCount;
  const teacherCount = safeUsers.filter(
    (user) => user.role === 'teacher'
  ).length;
  const restrictedUsers = safeUsers.filter(
    (user) => user.accountStatus === 'restricted'
  ).length;
  const bannedUsers = safeUsers.filter(
    (user) => user.accountStatus === 'banned'
  ).length;
  const upcomingEvents = events.filter(
    (event) => event.status === 'upcoming'
  ).length;
  const totalEventParticipants = events.reduce(
    (total, event) => total + event.participantCount,
    0
  );
  const analyticsMaxMetric = Math.max(
    summary.totalUsers,
    activeClubs.length,
    requests.length,
    events.length,
    1
  );
  const analyticsBars = [
    ['Хэрэглэгч', summary.totalUsers],
    ['Клуб', activeClubs.length],
    ['Хүсэлт', requests.length],
    ['Арга хэмжээ', events.length],
  ] as const;
  const upcomingEventCount = upcomingEvents;
  const ongoingEventCount = events.filter(
    (event) => event.status === 'ongoing'
  ).length;
  const completedEventCount = events.filter(
    (event) => event.status === 'completed'
  ).length;
  const cancelledEventCount = events.filter(
    (event) => event.status === 'cancelled'
  ).length;
  const weeklySchedule = useMemo(() => {
    const weekStart = startOfWeek(new Date());
    const todayIso = formatIsoDate(new Date());

    return weekDays.map((day, index) => {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + index);
      const isoDate = formatIsoDate(currentDate);

      const clubItems = activeClubs
        .filter((club) => parseAllowedDays(club.allowedDays).includes(day.key))
        .map((club) => ({
          id: `club-${club.id}-${day.key}`,
          kind: 'club' as const,
          title: club.clubName,
          meta: `${club.teacher} · ${
            club.clubStatus === 'active' ? 'Идэвхтэй' : 'Түр зогссон'
          }`,
        }));

      const requestItems = requests
        .filter((request) =>
          parseAllowedDays(request.allowedDays).includes(day.key)
        )
        .map((request) => ({
          id: `request-${request.id}-${day.key}`,
          kind: 'request' as const,
          title: request.clubName,
          meta: `${request.teacher} · Хүсэлт`,
        }));

      const eventItems = events
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
        items: [...clubItems, ...requestItems, ...eventItems],
      };
    });
  }, [activeClubs, events, requests]);
  const weeklyItemCount = useMemo(
    () => weeklySchedule.reduce((total, day) => total + day.items.length, 0),
    [weeklySchedule]
  );

  return (
    <main className="relative min-h-screen overflow-hidden text-[color:var(--foreground)]">
      <div className="relative mx-auto">
        {!activeSection ? (
          <>
            <section className="dashboard-entrance dashboard-entrance-delay-3 mt-4">
              <article className={`${panelClass} p-5`}>
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-center gap-4 text-[#183153]">
                    <CalendarDays className="h-5 w-5 text-[#49a0e3]" />
                    <div>
                      <h2 className="text-base font-semibold">
                        Нэгдсэн календарь
                      </h2>
                      <p className="text-sm text-[#6f86a7]">
                        Бүх клуб, хүсэлт, арга хэмжээг 7 хоногоор харуулна.
                      </p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[color:var(--surface)] px-4 py-3 text-sm text-[#183153]">
                    <p className="font-semibold">{weeklyItemCount} хуваарь</p>
                    <p className="text-[#6f86a7]">Энэ долоо хоногт</p>
                  </div>
                </div>

                <div className="mt-5 overflow-x-auto pb-2">
                  <div className="grid min-w-[980px] grid-cols-7 gap-3 xl:w-[140%]">
                    {weeklySchedule.map((day) => (
                      <div
                        key={day.isoDate}
                        className={`flex min-h-[220px] flex-col rounded-[24px] border px-2 py-4 ${
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
                            <p className="text-xs text-[#6f86a7]">
                              {day.dateLabel}
                            </p>
                          </div>
                          {day.isToday ? (
                            <span className="rounded-full bg-[#49a0e3] px-2 py-1 text-[11px] font-semibold text-white">
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
                                className={`rounded-2xl p-2 text-xs ${
                                  item.kind === 'event'
                                    ? 'bg-[#183153] text-white'
                                    : item.kind === 'request'
                                    ? 'bg-[#fff7e6] text-[#7a5200]'
                                    : 'bg-[#49a0e3] text-white'
                                }`}
                              >
                                <p className="font-medium">{item.title}</p>
                                <p
                                  className={`mt-1 ${
                                    item.kind === 'request'
                                      ? 'text-[#8a6417]'
                                      : 'text-white/80'
                                  }`}
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
                </div>
              </article>
            </section>

            <section className="dashboard-entrance dashboard-entrance-delay-3 mt-4 grid gap-4 xl:grid-cols-3">
              <article className={panelClass}>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-[color:var(--primary)]" />
                  <p className="text-base font-semibold text-[#183153]">
                    Тэргүүлэгчид
                  </p>
                </div>

                <div className="mt-3 space-y-2.5">
                  {spotlightUsers.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-6 text-center text-xs text-[#6983a4]">
                      Тэргүүлэгч хэрэглэгч одоогоор алга.
                    </div>
                  ) : null}
                  {spotlightUsers.map((user, index) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-[color:var(--surface)] px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                            index === 0
                              ? 'bg-[#f5bf50] text-[#6b4a00]'
                              : index === 1
                              ? 'bg-[#e8f0fb] text-[#486382]'
                              : index === 2
                              ? 'bg-[#c9e6ff] text-[#28638c]'
                              : 'bg-[#eef5ff] text-[#4f6b8d]'
                          }`}
                        >
                          {user.rank}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#183153]">
                            {user.name}
                          </p>
                          <p className="truncate text-xs text-[#6983a4]">
                            {user.role === 'teacher' ? 'Багш' : 'Сурагч'} ·{' '}
                            {user.accountStatus === 'active'
                              ? 'Идэвхтэй'
                              : user.accountStatus === 'restricted'
                              ? 'Хязгаарласан'
                              : 'Хориглосон'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold text-[color:var(--primary)]">
                          {user.points.toLocaleString()}
                        </p>
                        <p className="text-xs text-[#8195af]">
                          {user.clubCount} клуб
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className={panelClass}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <ChartColumnIncreasing className="h-4 w-4 text-[color:var(--primary)]" />
                      <p className="text-base font-semibold text-[#183153]">
                        Аналитикийн тойм
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {analyticsBars.map(([label, value]) => (
                    <div key={label}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-semibold text-[#183153]">
                          {label}
                        </span>
                        <span className="text-[#6c829f]">{value}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[color:var(--surface)]">
                        <div
                          className="h-full rounded-full bg-[color:var(--primary)]"
                          style={{
                            width: `${Math.max(
                              8,
                              (value / analyticsMaxMetric) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className={panelClass}>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-[color:var(--primary)]" />
                  <p className="text-base font-semibold text-[#183153]">
                    Үндсэн үзүүлэлтүүд
                  </p>
                </div>

                <div className="mt-3 grid gap-2">
                  {[
                    ['Багш', teacherCount],
                    ['Идэвхтэй клуб', activeClubStatusCount],
                    ['Түр зогссон клуб', pausedClubStatusCount],
                    ['Удахгүй болох арга хэмжээ', upcomingEvents],
                    ['Арга хэмжээний оролцогч', totalEventParticipants],
                    ['Хязгаарласан хэрэглэгч', restrictedUsers],
                    ['Хориглосон хэрэглэгч', bannedUsers],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded-xl bg-[color:var(--surface)] px-3 py-2"
                    >
                      <span className="text-sm font-medium text-[#5f7697]">
                        {label}
                      </span>
                      <span className="font-semibold text-[#183153]">
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          </>
        ) : null}

        {activeSection ? (
          <section
            className={`${panelClass} dashboard-entrance dashboard-entrance-delay-5 mt-6 rounded-[30px] border-[color:var(--border)] bg-[color:var(--card)] px-5 py-5`}
          >
            {activeSection === 'requests' ? (
              <>
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.85fr)]">
                  <article>
                    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <BadgeAlert className="h-4 w-4 text-[color:var(--primary)]" />
                          <p className="text-lg font-semibold text-[#183153]">
                            Клубийн хүсэлтүүд
                          </p>
                        </div>
                        <p className="mt-2 text-sm text-[#6c829f]">
                          Хүлээгдэж буй клубийн хүсэлтүүдийг эндээс шалгаад
                          Зөвшөөрөх эсвэл татгалзана.
                        </p>
                      </div>

                      <StatusBadge
                        type="review"
                        text={`${pendingRequests.length} хүлээгдэж буй`}
                      />
                    </div>

                    <div className="overflow-hidden rounded-[26px] border border-[color:var(--border)] bg-[color:var(--surface-strong)]">
                      <div className="grid gap-4 border-b border-[color:var(--border)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#7f93b1] sm:grid-cols-[1.2fr_0.95fr_0.8fr_0.8fr]">
                        <span>Клуб</span>
                        <span>Сонирхол</span>
                        <span>Төлөв</span>
                        <span className="text-right">Үйлдэл</span>
                      </div>

                      <div className="divide-y divide-[#e7eef9]">
                        {requests.length === 0 ? (
                          <div className="px-4 py-8 text-center text-sm text-[#6f86a7]">
                            Шалгах клубийн хүсэлт одоогоор байхгүй байна.
                          </div>
                        ) : (
                          requests.map((club) => {
                            const thresholdReached =
                              club.interestCount >= thresholdGoal;

                            return (
                              <div
                                key={club.id}
                                className="grid items-center gap-4 px-4 py-4 transition hover:bg-[color:var(--surface)] sm:grid-cols-[1.2fr_0.95fr_0.8fr_0.8fr]"
                              >
                                <div>
                                  <p className="font-semibold text-[#183153]">
                                    {club.clubName}
                                  </p>
                                  <p className="mt-1 text-sm text-[#6f86a7]">
                                    {club.teacher} · {club.gradeRange}
                                  </p>
                                </div>

                                <div className="flex items-center gap-3">
                                  <CapacityBar
                                    current={club.interestCount}
                                    total={thresholdGoal}
                                  />
                                </div>

                                <StatusBadge
                                  type={
                                    club.requestStatus === 'approved'
                                      ? 'approved'
                                      : club.requestStatus === 'rejected'
                                      ? 'rejected'
                                      : thresholdReached
                                      ? 'approved'
                                      : 'pending'
                                  }
                                  text={
                                    club.requestStatus === 'approved'
                                      ? 'Батлагдсан'
                                      : club.requestStatus === 'rejected'
                                      ? 'Татгалзсан'
                                      : thresholdReached
                                      ? 'Бэлэн'
                                      : 'Босгод хүрээгүй'
                                  }
                                />

                                <div className="flex items-center justify-end gap-3">
                                  <button
                                    type="button"
                                    onClick={() => void rejectRequest(club.id)}
                                    disabled={
                                      club.requestStatus !== 'pending' ||
                                      isSaving
                                    }
                                    className="rounded-full px-3 py-2 text-sm font-semibold text-[#ff5c5c] transition hover:bg-[#fff1f2] hover:text-[#e33f3f] disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    Татгалзах
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => void approveRequest(club.id)}
                                    disabled={
                                      club.requestStatus !== 'pending' ||
                                      isSaving
                                    }
                                    className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(79,114,213,0.22)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#b5d0f3]"
                                  >
                                    Зөвшөөрөх
                                  </button>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </article>
                  <aside className="space-y-5">
                    <section className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-soft">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7f93b1]">
                            Босго
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 space-y-4">
                        {spotlightClubs.map((club) => (
                          <div
                            key={club.id}
                            className="rounded-[22px] bg-[color:var(--surface)] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="font-medium text-[#183153]">
                                  {club.clubName}
                                </p>
                                <p className="text-xs text-black">
                                  {club.teacher}
                                </p>
                              </div>
                              <StatusBadge
                                type={
                                  club.interestCount >= thresholdGoal
                                    ? 'approved'
                                    : 'pending'
                                }
                                text={formatThresholdLabel(club.interestCount)}
                              />
                            </div>
                            <div className="mt-3">
                              <CapacityBar
                                current={club.interestCount}
                                total={thresholdGoal}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </aside>
                </div>
              </>
            ) : null}

            {activeSection === 'users' ? (
              <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <form
                  className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--card)] p-5"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void handleCreateUser();
                  }}
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7f93b1]">
                      Шинэ хэрэглэгч
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-[#183153]">
                      Удирдах хэрэглэгчийн бүртгэл үүсгэх
                    </h3>
                    <p className="mt-2 text-sm text-[#6c829f]">
                      Энэ маягтаар сурагч эсвэл багшийн бүртгэл нэмнэ.
                    </p>
                  </div>

                  <div className="mt-6 space-y-4">
                    <label className="block">
                      <span className={inputLabelClass}>Нэр</span>
                      <input
                        type="text"
                        value={userForm.name}
                        onChange={(event) =>
                          updateUserField('name', event.target.value)
                        }
                        className={fieldClass}
                      />
                    </label>

                    <label className="block">
                      <span className={inputLabelClass}>Имэйл</span>
                      <input
                        type="email"
                        value={userForm.email}
                        onChange={(event) =>
                          updateUserField('email', event.target.value)
                        }
                        className={fieldClass}
                      />
                    </label>

                    <label className="block">
                      <span className={inputLabelClass}>Үүрэг</span>
                      <select
                        value={userForm.role}
                        onChange={(event) =>
                          updateUserField('role', event.target.value)
                        }
                        className={fieldClass}
                      >
                        {userRoleOptions.map((role) => (
                          <option key={role} value={role}>
                            {role === 'teacher' ? 'Багш' : 'Сурагч'}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="block">
                      <span className={inputLabelClass}>Шалтгаан</span>
                      <textarea
                        rows={4}
                        value={userForm.reason}
                        onChange={(event) =>
                          updateUserField('reason', event.target.value)
                        }
                        className={fieldClass}
                      />
                    </label>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="rounded-full bg-[color:var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(79,114,213,0.22)] transition hover:opacity-90"
                    >
                      Хэрэглэгч нэмэх
                    </button>
                    <button
                      type="button"
                      onClick={resetUserForm}
                      className="rounded-full border border-[color:var(--border)] bg-white px-5 py-2.5 text-sm font-semibold text-[#56708f] transition hover:bg-[color:var(--surface)]"
                    >
                      Дахин тохируулах
                    </button>
                  </div>
                </form>

                <div className="space-y-4">
                  {users.map((user, index) => (
                    <article
                      key={user.id}
                      className={`rounded-[28px] border p-5 shadow-soft ${
                        user.accountStatus === 'banned'
                          ? 'border-[#ffd2d5] bg-[#fff7f8]'
                          : user.accountStatus === 'restricted'
                          ? 'border-[#ffe4b7] bg-[#fffaf0]'
                          : 'border-[color:var(--border)] bg-[color:var(--card)]'
                      } ${index === 0 ? 'dashboard-entrance-delay-1' : ''}`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-semibold text-[#183153]">
                              {user.name}
                            </h3>
                            <StatusBadge
                              type={user.role}
                              text={user.role === 'teacher' ? 'Багш' : 'Сурагч'}
                            />
                            <StatusBadge
                              type={user.accountStatus}
                              text={
                                user.accountStatus === 'active'
                                  ? 'Идэвхтэй'
                                  : user.accountStatus === 'restricted'
                                  ? 'Хязгаарласан'
                                  : 'Хориглосон'
                              }
                            />
                          </div>
                          <p className="mt-1 text-sm text-[#6f86a7]">
                            {user.email}
                          </p>
                        </div>
                        <div className="text-right text-xs text-[#6f86a7]">
                          <p>Сүүлд идэвхтэй</p>
                          <p className="mt-1 font-semibold text-[#183153]">
                            {user.lastActive}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-[#60789a]">
                        {user.reason}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#60789a]">
                        {user.notes}
                      </p>

                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {[
                          [
                            'Үүрэг',
                            user.role === 'teacher' ? 'Багш' : 'Сурагч',
                          ],
                          ['Клубүүд', user.clubCount],
                          [
                            'Төлөв',
                            user.accountStatus === 'active'
                              ? 'Идэвхтэй'
                              : user.accountStatus === 'restricted'
                              ? 'Хязгаарласан'
                              : 'Хориглосон',
                          ],
                          ['ID', user.id],
                        ].map(([label, value]) => (
                          <div
                            key={`${user.id}-${label}`}
                            className="rounded-[18px] bg-white px-3 py-3 shadow-[0_10px_22px_rgba(24,58,112,0.05)]"
                          >
                            <p className="text-[11px] uppercase tracking-[0.18em] text-[#7f93b1]">
                              {label}
                            </p>
                            <p className="mt-1 text-sm font-medium text-[#183153]">
                              {value}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            void updateUserRole(
                              user.id,
                              user.role === 'student' ? 'teacher' : 'student'
                            )
                          }
                          disabled={isSaving}
                          className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                        >
                          {user.role === 'student'
                            ? 'Багш болгох'
                            : 'Сурагч болгох'}
                        </button>
                        <button
                          type="button"
                          onClick={() => void toggleUserRestriction(user.id)}
                          disabled={isSaving}
                          className="rounded-full border border-[#e3c98a] bg-white px-4 py-2 text-xs font-semibold text-[#ae7922] transition hover:bg-[#fff8e8]"
                        >
                          {user.accountStatus === 'restricted'
                            ? 'Хязгаарлалтыг авах'
                            : 'Хязгаарлах'}
                        </button>
                        <button
                          type="button"
                          onClick={() => void toggleUserBan(user.id)}
                          disabled={isSaving}
                          className="rounded-full border border-[#f4b5ba] bg-white px-4 py-2 text-xs font-semibold text-[#de4a58] transition hover:bg-[#fff6f7]"
                        >
                          {user.accountStatus === 'banned'
                            ? 'Хориг цуцлах'
                            : 'Хориглох'}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {activeSection === 'clubs' ? (
              <section className="mt-6 space-y-5">
                <div className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-soft">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-[color:var(--primary)]" />
                        <h2 className="text-2xl font-bold text-[#183153]">
                          Клубын төлөв
                        </h2>
                      </div>
                      <p className="mt-2 text-sm text-[#6c829f]">
                        Идэвхтэй болон түр зогссон клубүүдийг эндээс удирдана.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-center">
                      {[
                        ['Нийт', activeClubs.length],
                        [
                          'Идэвхтэй',
                          activeClubs.filter(
                            (club) => club.clubStatus === 'active'
                          ).length,
                        ],
                        [
                          'Түр зогссон',
                          activeClubs.filter(
                            (club) => club.clubStatus === 'paused'
                          ).length,
                        ],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-2xl bg-[color:var(--surface)] px-4 py-3"
                        >
                          <p className="text-xl font-semibold text-[#183153]">
                            {value}
                          </p>
                          <p className="text-xs text-[#6f86a7]">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {activeClubs.length === 0 ? (
                  <div className="rounded-[28px] border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-10 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--primary-soft)]">
                      <ShieldCheck className="h-6 w-6 text-[color:var(--primary)]" />
                    </div>
                    <p className="mt-4 font-semibold text-[#183153]">
                      Клубын төлөв хоосон байна
                    </p>
                    <p className="mt-1 text-sm text-[#6982a2]">
                      Хүсэлтийг баталсны дараа идэвхтэй клуб энд харагдана.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {activeClubs.map((club) => (
                      <article
                        key={club.id}
                        className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-soft"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-semibold text-[#183153]">
                              {club.clubName}
                            </h3>
                            <p className="mt-1 text-sm text-[#6f86a7]">
                              {club.teacher}
                            </p>
                          </div>
                          <StatusBadge
                            type={club.clubStatus}
                            text={
                              club.clubStatus === 'active'
                                ? 'Идэвхтэй'
                                : 'Түр зогссон'
                            }
                          />
                        </div>

                        <div className="mt-4 space-y-3 text-sm text-[#60789a]">
                          <p>{club.note}</p>
                          <p>
                            {club.allowedDays} · {club.gradeRange}
                          </p>
                          <p>
                            {club.startDate} - {club.endDate}
                          </p>
                          <p className="font-semibold text-[#183153]">
                            Сурагчид: {club.memberCount} / {club.studentLimit}
                          </p>
                          <CapacityBar
                            current={club.interestCount}
                            total={club.studentLimit}
                          />
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <button
                            type="button"
                            onClick={() => void toggleClubStatus(club.id)}
                            disabled={isSaving}
                            className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                          >
                            {club.clubStatus === 'active'
                              ? 'Түр зогсоох'
                              : 'Идэвхжүүлэх'}
                          </button>
                          <StatusBadge
                            type={
                              club.interestCount >= thresholdGoal
                                ? 'approved'
                                : 'pending'
                            }
                            text={formatThresholdLabel(club.interestCount)}
                          />
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            ) : null}

            {activeSection === 'events' ? (
              <section className="mt-6 space-y-5">
                <div className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-soft">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-[color:var(--primary)]" />
                        <h2 className="text-2xl font-bold text-[#183153]">
                          Сургуулийн арга хэмжээ
                        </h2>
                      </div>
                      <p className="mt-2 text-sm text-[#6c829f]">
                        Сургуулийн арга хэмжээ үүсгэхэд бүх хэрэглэгч автоматаар
                        оролцогчоор нэмэгдэнэ.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-5">
                      {[
                        ['Нийт', events.length],
                        ['Удахгүй', upcomingEventCount],
                        ['Явагдаж буй', ongoingEventCount],
                        ['Дууссан', completedEventCount],
                        ['Цуцлагдсан', cancelledEventCount],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-2xl bg-[color:var(--surface)] px-4 py-3"
                        >
                          <p className="text-xl font-semibold text-[#183153]">
                            {value}
                          </p>
                          <p className="text-xs text-[#6f86a7]">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl bg-[color:var(--primary-soft)] px-4 py-3 text-sm font-semibold text-[#365f91]">
                    Нийт автоматаар нэмэгдсэн оролцогч: {totalEventParticipants}
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
                  <div className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-soft">
                    <button
                      type="button"
                      onClick={openEventDialog}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(79,114,213,0.22)] transition hover:opacity-90"
                    >
                      <Plus className="h-4 w-4" />
                      Шинэ арга хэмжээ
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[color:var(--primary)]" />
                      <p className="text-lg font-semibold text-[#183153]">
                        Бүх арга хэмжээ ({events.length})
                      </p>
                    </div>

                    {events.length === 0 ? (
                      <div className="rounded-[28px] border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-10 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--primary-soft)]">
                          <CalendarDays className="h-6 w-6 text-[color:var(--primary)]" />
                        </div>
                        <p className="mt-4 font-semibold text-[#183153]">
                          Арга хэмжээ байхгүй байна
                        </p>
                        <p className="mt-1 text-sm text-[#6982a2]">
                          Эхний арга хэмжээ үүсгэхэд бүх хэрэглэгч автоматаар
                          нэгдэнэ.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {events.map((event) => {
                          const statusColor =
                            event.status === 'upcoming'
                              ? 'bg-[#eef4ff] text-[#4f72d5]'
                              : event.status === 'ongoing'
                              ? 'bg-[#e6fbf0] text-[#1a8f5a]'
                              : event.status === 'completed'
                              ? 'bg-[#f0f0f0] text-[#6b7280]'
                              : 'bg-[#fff0f0] text-[#d94f4f]';

                          const statusLabel =
                            event.status === 'upcoming'
                              ? 'Удахгүй'
                              : event.status === 'ongoing'
                              ? 'Явагдаж буй'
                              : event.status === 'completed'
                              ? 'Дууссан'
                              : 'Цуцлагдсан';

                          const nextStatusLabel =
                            event.status === 'upcoming'
                              ? 'Явагдаж буй болгох'
                              : event.status === 'ongoing'
                              ? 'Дууссан болгох'
                              : 'Удахгүй болгох';

                          return (
                            <article
                              key={event.id}
                              className="rounded-[24px] border border-[color:var(--border)] bg-[color:var(--card)] p-4 shadow-soft"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <h3 className="truncate font-semibold text-[#183153]">
                                    {event.title}
                                  </h3>
                                  <p className="mt-0.5 text-xs text-[#6f86a7]">
                                    {event.eventDate}
                                    {event.startTime
                                      ? ` · ${event.startTime}`
                                      : ''}
                                    {event.location
                                      ? ` · ${event.location}`
                                      : ''}
                                  </p>
                                </div>
                                <span
                                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}
                                >
                                  {statusLabel}
                                </span>
                              </div>

                              {event.description ? (
                                <p className="mt-2 text-sm leading-5 text-[#60789a]">
                                  {event.description}
                                </p>
                              ) : null}

                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--surface)] px-3 py-1 text-xs font-medium text-[#5f7697]">
                                  <Users className="h-3 w-3" />
                                  {event.participantCount} оролцогч
                                </span>
                                <Link
                                  href={`/admin/events/${event.id}`}
                                  className="rounded-full border border-[color:var(--border)] bg-white px-3 py-1 text-xs font-semibold text-[#183153] transition hover:bg-[color:var(--surface)]"
                                >
                                  Постууд
                                </Link>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleToggleEventStatus(event.id)
                                  }
                                  disabled={isSaving}
                                  className="rounded-full border border-[color:var(--border)] bg-white px-3 py-1 text-xs font-semibold text-[#183153] transition hover:bg-[color:var(--surface)] disabled:opacity-40"
                                >
                                  {nextStatusLabel}
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleCancelEvent(event.id)
                                  }
                                  disabled={
                                    isSaving || event.status === 'cancelled'
                                  }
                                  className="rounded-full border border-[#ffe1a8] bg-white px-3 py-1 text-xs font-semibold text-[#b7791f] transition hover:bg-[#fff8e8] disabled:opacity-40"
                                >
                                  Цуцлах
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    void handleDeleteEvent(event.id)
                                  }
                                  disabled={isSaving}
                                  className="rounded-full border border-[#ffd2d5] bg-white px-3 py-1 text-xs font-semibold text-[#de4a58] transition hover:bg-[#fff6f7] disabled:opacity-40"
                                >
                                  Устгах
                                </button>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {isEventDialogOpen ? (
                  <div
                    className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center"
                    onClick={(e) => {
                      if (e.target === e.currentTarget) closeEventDialog();
                    }}
                  >
                    <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-[28px] border border-[color:var(--border)] bg-[color:var(--card)] shadow-2xl">
                      <div className="p-6 pb-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4 text-[color:var(--primary)]" />
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7f93b1]">
                                Шинэ арга хэмжээ
                              </p>
                            </div>
                            <h3 className="mt-2 text-xl font-semibold text-[#183153]">
                              Сургуулийн арга хэмжээ үүсгэх
                            </h3>
                            <p className="mt-2 text-sm text-[#6c829f]">
                              Гарчиг болон огноо заавал оруулна. Үүссэний дараа
                              бүх хэрэглэгч автоматаар арга хэмжээнд нэгдэнэ.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={closeEventDialog}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#6982a2] transition hover:bg-[color:var(--surface)]"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          void handleCreateEvent();
                        }}
                        className="flex min-h-0 flex-1 flex-col"
                      >
                        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-4">
                          <div className="space-y-4">
                            <label className="block">
                              <span className={inputLabelClass}>
                                Арга хэмжээний гарчиг
                              </span>
                              <input
                                type="text"
                                required
                                value={eventForm.title}
                                onChange={(e) =>
                                  updateEventField('title', e.target.value)
                                }
                                placeholder="Жишээ: Сургуулийн тамирын өдөр"
                                className={fieldClass}
                              />
                            </label>

                            <label className="block">
                              <span className={inputLabelClass}>Огноо</span>
                              <input
                                type="date"
                                required
                                value={eventForm.eventDate}
                                onChange={(e) =>
                                  updateEventField('eventDate', e.target.value)
                                }
                                className={fieldClass}
                              />
                            </label>

                            <div className="grid gap-4 sm:grid-cols-2">
                              <label className="block">
                                <span className={inputLabelClass}>
                                  Эхлэх цаг
                                </span>
                                <input
                                  type="time"
                                  value={eventForm.startTime}
                                  onChange={(e) =>
                                    updateEventField(
                                      'startTime',
                                      e.target.value
                                    )
                                  }
                                  className={fieldClass}
                                />
                              </label>
                              <label className="block">
                                <span className={inputLabelClass}>
                                  Дуусах цаг
                                </span>
                                <input
                                  type="time"
                                  value={eventForm.endTime}
                                  onChange={(e) =>
                                    updateEventField('endTime', e.target.value)
                                  }
                                  className={fieldClass}
                                />
                              </label>
                            </div>

                            <label className="block">
                              <span className={inputLabelClass}>Байршил</span>
                              <input
                                type="text"
                                value={eventForm.location}
                                onChange={(e) =>
                                  updateEventField('location', e.target.value)
                                }
                                placeholder="Жишээ: Тамирын заал, 3-р давхар"
                                className={fieldClass}
                              />
                            </label>

                            <label className="block">
                              <span className={inputLabelClass}>Тайлбар</span>
                              <textarea
                                rows={3}
                                value={eventForm.description}
                                onChange={(e) =>
                                  updateEventField(
                                    'description',
                                    e.target.value
                                  )
                                }
                                placeholder="Арга хэмжээний дэлгэрэнгүй мэдээлэл..."
                                className={fieldClass}
                              />
                            </label>
                          </div>
                        </div>

                        <div className="shrink-0 border-t border-[color:var(--border)] bg-[color:var(--card)] px-6 py-4">
                          {eventFormError ? (
                            <div className="mb-3 rounded-2xl border border-[#ffd2d5] bg-[#fff7f8] px-4 py-3 text-sm font-semibold text-[#b23a49]">
                              {eventFormError}
                            </div>
                          ) : null}

                          <div className="flex flex-wrap items-center gap-3">
                            <button
                              type="submit"
                              disabled={!canCreateEvent}
                              className="rounded-full bg-[color:var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(79,114,213,0.22)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#b5d0f3]"
                            >
                              Арга хэмжээ үүсгээд автоматаар нэмэх
                            </button>
                            <button
                              type="button"
                              onClick={resetEventForm}
                              className="rounded-full border border-[color:var(--border)] bg-white px-5 py-2.5 text-sm font-semibold text-[#56708f] transition hover:bg-[color:var(--surface)]"
                            >
                              Цэвэрлэх
                            </button>
                            <button
                              type="button"
                              onClick={closeEventDialog}
                              className="rounded-full border border-[color:var(--border)] bg-white px-5 py-2.5 text-sm font-semibold text-[#56708f] transition hover:bg-[color:var(--surface)]"
                            >
                              Цуцлах
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                ) : null}
              </section>
            ) : null}
          </section>
        ) : null}
      </div>
    </main>
  );
}

export default function AdminDashboard() {
  return <AdminDashboardContent activeSection={null} />;
}
