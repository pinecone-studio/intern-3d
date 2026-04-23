'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  BadgeAlert,
  CalendarDays,
  ChartColumnIncreasing,
  LayoutGrid,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Settings2,
  Trophy,
  UserCog,
  Users,
} from 'lucide-react';

import { CapacityBar, StatusBadge } from '@/app/_components';
import {
  dayOptions,
  gradeOptions,
  userRoleOptions,
  teacherOptions,
} from './admin-data';
import { useAdminDashboard } from './useAdminDashboard';

type AdminSection = 'requests' | 'users' | 'clubs' | 'spam' | 'events' | 'leaderboard' | 'badges';

const monthLabels = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const fieldClass =
  'w-full rounded-[18px] border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm text-[color:var(--text)] outline-none transition placeholder:text-[#8aa0be] focus:border-[color:var(--primary)] focus:bg-white focus:ring-4 focus:ring-[color:var(--primary-soft)]';

const panelClass =
  'rounded-[32px] border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-soft backdrop-blur';

const inputLabelClass = 'mb-2 block text-sm font-semibold text-[#5f7697]';

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>('requests');
  const {
    activeClubs,
    activeCount,
    approveRequest,
    badges,
    banner,
    errorMessage,
    events,
    eventForm,
    form,
    handleCreate,
    handleCreateBadge,
    handleCreateEvent,
    handleCreateUser,
    handleDeleteBadge,
    handleDeleteEvent,
    handleToggleEventStatus,
    isLoading,
    isSaving,
    leaderboard,
    pendingRequests,
    rejectRequest,
    removeSpamClub,
    requests,
    spamQueue,
    resetEventForm,
    resetUserForm,
    thresholdGoal,
    thresholdReachedCount,
    resetForm,
    toggleClubStatus,
    toggleUserBan,
    toggleUserRestriction,
    updateEventField,
    updateUserField,
    updateUserRole,
    updateField,
    formatThresholdLabel,
    summary,
    userForm,
    users,
  } = useAdminDashboard();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleCreate();
  };

  const sectionItems = [
    {
      key: 'requests',
      label: 'Requests',
      count: pendingRequests.length,
      icon: CalendarDays,
    },
    {
      key: 'users',
      label: 'Users',
      count: summary.totalUsers,
      icon: UserCog,
    },
    {
      key: 'clubs',
      label: 'Clubs',
      count: activeClubs.length,
      icon: LayoutGrid,
    },
    {
      key: 'spam',
      label: 'Spam',
      count: summary.spamRequests,
      icon: ShieldAlert,
    },
    {
      key: 'events',
      label: 'Events',
      count: events.length,
      icon: CalendarDays,
    },
    {
      key: 'leaderboard',
      label: 'Leaderboard',
      count: leaderboard.length,
      icon: Users,
    },
    {
      key: 'badges',
      label: 'Badges',
      count: badges.length,
      icon: ShieldAlert,
    },
  ] as const;

  const summaryCards = [
    {
      label: 'Total users',
      value: summary.totalUsers,
      delta: '+4.2%',
      icon: Users,
      tint: 'bg-gradient-primary',
      badge: 'bg-[#edf3ff] text-[#4f72d5]',
    },
    {
      label: 'Active clubs',
      value: activeCount,
      delta: `+${activeClubs.length}`,
      icon: ShieldCheck,
      tint: 'bg-gradient-teacher',
      badge: 'bg-[#eaf8ff] text-[#1f95ca]',
    },
    {
      label: 'Pending reviews',
      value: summary.pendingRequests,
      delta: `+${thresholdReachedCount}`,
      icon: CalendarDays,
      tint: 'bg-gradient-student',
      badge: 'bg-[#eef4ff] text-[#4f77d6]',
    },
    {
      label: 'Flagged clubs',
      value: summary.spamRequests,
      delta: `+${Math.max(1, summary.spamRequests) * 9}%`,
      icon: ShieldAlert,
      tint: 'bg-gradient-admin',
      badge: 'bg-[#e8fbfd] text-[#1c9bb3]',
    },
  ];

  const leaderboard = [...users]
    .sort((left, right) => {
      if (right.clubCount !== left.clubCount) {
        return right.clubCount - left.clubCount;
      }

      return left.name.localeCompare(right.name);
    })
    .slice(0, 5)
    .map((user, index) => ({
      ...user,
      rank: index + 1,
      points:
        3200 +
        user.clubCount * 410 +
        (user.role === 'teacher' ? 220 : 0) +
        (user.accountStatus === 'active' ? 160 : 0),
    }));

  const activitySeries = [
    summary.pendingRequests * 8 + 22,
    activeClubs.length * 10 + 28,
    summary.totalUsers * 2 + 34,
    thresholdReachedCount * 11 + 18,
    summary.spamRequests * 12 + 16,
    requests.length * 5 + 24,
    activeCount * 12 + 26,
    summary.pendingRequests * 6 + 42,
    thresholdReachedCount * 8 + 35,
    summary.totalUsers * 3 + 39,
    summary.spamRequests * 9 + 20,
    activeClubs.length * 7 + 48,
  ].map((value) => Math.min(92, Math.max(18, value)));

  const activityPath = activitySeries
    .map(
      (value, index) =>
        `${index === 0 ? 'M' : 'L'} ${
          (index / (activitySeries.length - 1)) * 100
        } ${100 - value}`
    )
    .join(' ');

  const activityArea = `${activityPath} L 100 100 L 0 100 Z`;

  const spotlightClubs = requests.slice(0, 3);
  const spotlightUsers = leaderboard.slice(0, 3);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-hero text-[color:var(--foreground)]">
      <div className="absolute left-[-5rem] top-20 h-64 w-64 rounded-full bg-[#c6e7ff]/55 blur-3xl" />
      <div className="absolute right-[-6rem] top-40 h-72 w-72 rounded-full bg-[#d5e3ff]/35 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[#d9f2ff]/28 blur-3xl" />

      <div className="relative mx-auto max-w-[1440px] px-0 py-0 sm:px-4 lg:px-8">
        <header className="dashboard-entrance rounded-b-[36px] border border-[color:var(--border)] border-t-0 bg-white/90 px-4 py-3 shadow-none sm:px-5 sm:py-3.5 lg:px-8">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex min-w-0 items-center gap-2 text-[#5f7697] sm:gap-2.5">
              <Link
                href="/"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-1.5 py-1 text-[0.78rem] font-medium transition hover:bg-[#eef6ff] hover:text-[#2e4e7e] sm:px-2 sm:text-[0.84rem]"
              >
                <ArrowLeft className="h-3 w-3" />
                Home
              </Link>
              <span className="h-5 w-px bg-[color:var(--border)]" />
              <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] bg-[color:var(--primary)] text-white shadow-[0_14px_28px_rgba(79,114,213,0.22)]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-[0.95rem] font-semibold tracking-tight text-[#183153] sm:text-[1rem]">
                    Admin Panel
                  </h1>
                  <p className="text-[0.68rem] text-[#6781a3] sm:text-[0.72rem]">
                    Full system control
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--primary-soft)] px-3 py-1.5 text-[0.78rem] font-medium text-[#58708f] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:px-4 sm:text-[0.84rem]">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Online
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[color:var(--primary-soft)] text-[0.84rem] font-semibold text-[color:var(--primary)] sm:h-10 sm:w-10">
                JD
              </span>
            </div>
          </div>
        </header>

        <section className="dashboard-entrance dashboard-entrance-delay-1 mt-6">
          <div
            className={`rounded-[28px] border px-5 py-4 shadow-soft ${
              errorMessage
                ? 'border-[#ffd2d5] bg-[#fff7f8] text-[#b23a49]'
                : 'border-[color:var(--border)] bg-white/85 text-[#56708f]'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em]">
                  {errorMessage
                    ? 'Sync error'
                    : isLoading
                    ? 'Loading live data'
                    : isSaving
                    ? 'Saving changes'
                    : 'Live sync'}
                </p>
                <p className="mt-1 text-sm">
                  {errorMessage ||
                    (isLoading
                      ? 'Cloudflare D1 дээрх өгөгдлийг admin dashboard руу ачаалж байна.'
                      : isSaving
                      ? 'Сүүлд хийсэн өөрчлөлтийг API-аар хадгалж байна.'
                      : banner)}
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[color:var(--primary-soft)] px-3 py-1.5 text-xs font-semibold text-[#4f6b8d]">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    errorMessage
                      ? 'bg-[#ff6b77]'
                      : isLoading || isSaving
                      ? 'bg-[#f2b84b]'
                      : 'bg-emerald-400'
                  }`}
                />
                {errorMessage ? 'Needs attention' : 'Connected'}
              </span>
            </div>
          </div>
        </section>

        <section className="dashboard-entrance dashboard-entrance-delay-2 mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.label}
                className={`${panelClass} relative min-h-[168px] overflow-hidden`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.tint} text-white shadow-[0_14px_28px_rgba(91,137,227,0.18)]`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${card.badge}`}
                  >
                    {card.delta}
                  </span>
                </div>

                <div className="mt-8">
                  <p className="text-3xl font-semibold tracking-tight text-[#183153]">
                    {card.value}
                  </p>
                  <p className="mt-2 text-sm text-[#6a819f]">{card.label}</p>
                </div>
              </article>
            );
          })}
        </section>

        <section className="dashboard-entrance dashboard-entrance-delay-3 mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.95fr)_minmax(340px,0.9fr)]">
          <article className={`${panelClass} min-h-[430px]`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[color:var(--primary)]">
                  <ChartColumnIncreasing className="h-4 w-4" />
                  <p className="text-sm font-semibold text-[#183153]">
                    Platform activity
                  </p>
                </div>
                <p className="mt-2 text-sm text-[#6c829f]">
                  Club approvals, activity, and moderation signals for the last
                  12 months.
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-[color:var(--primary-soft)] px-4 py-2 text-sm font-semibold text-[#365f91]">
                Last 12 months
              </span>
            </div>

            <div className="mt-6 h-[300px] overflow-hidden rounded-[28px] border border-[color:var(--border)] bg-[linear-gradient(180deg,_rgba(247,251,255,0.92),_rgba(255,255,255,0.94))] p-4">
              <div className="relative h-full">
                <div className="absolute inset-0 rounded-[24px] bg-[linear-gradient(180deg,_transparent_0%,_transparent_calc(100%-1px),_rgba(219,230,247,0.72)_calc(100%-1px))]" />
                <div className="absolute inset-0 grid grid-cols-12 items-end gap-2 px-2 pb-8">
                  {activitySeries.map((value, index) => (
                    <div
                      key={`${monthLabels[index]}-${value}`}
                      className="flex h-full flex-col justify-end"
                    >
                      <div
                        className="rounded-t-[18px] bg-[linear-gradient(180deg,_#6bb0f0_0%,_#99c8ff_52%,_#c8ddff_100%)] shadow-[0_12px_26px_rgba(88,134,221,0.18)]"
                        style={{ height: `${value}%` }}
                      />
                    </div>
                  ))}
                </div>

                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="absolute inset-x-3 bottom-10 top-4 h-[calc(100%-1.75rem)] w-[calc(100%-1.5rem)]"
                >
                  <defs>
                    <linearGradient
                      id="admin-chart-area"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#6faef4"
                        stopOpacity="0.34"
                      />
                      <stop
                        offset="100%"
                        stopColor="#6faef4"
                        stopOpacity="0.03"
                      />
                    </linearGradient>
                    <linearGradient
                      id="admin-chart-line"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop offset="0%" stopColor="#4f8fe7" />
                      <stop offset="100%" stopColor="#78b8ff" />
                    </linearGradient>
                  </defs>
                  <path d={activityArea} fill="url(#admin-chart-area)" />
                  <path
                    d={activityPath}
                    fill="none"
                    stroke="url(#admin-chart-line)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {activitySeries.map((value, index) => {
                    const x = (index / (activitySeries.length - 1)) * 100;

                    return (
                      <circle
                        key={`${monthLabels[index]}-point`}
                        cx={x}
                        cy={100 - value}
                        r="1.8"
                        fill="#ffffff"
                        stroke="#5a9cec"
                        strokeWidth="1.2"
                      />
                    );
                  })}
                </svg>

                <div className="absolute inset-x-0 bottom-2 flex justify-between px-2 text-[11px] text-[#6e84a5]">
                  {monthLabels.map((month) => (
                    <span key={month}>{month}</span>
                  ))}
                </div>
              </div>
            </div>
          </article>

          <article className={panelClass}>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-[color:var(--primary)]" />
              <p className="text-lg font-semibold text-[#183153]">
                Leaderboard
              </p>
            </div>

            <div className="mt-5 space-y-4">
              {spotlightUsers.map((user, index) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-4 rounded-[24px] bg-[color:var(--surface)] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
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
                      <p className="truncate font-semibold text-[#183153]">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-[#6983a4]">
                        {user.role === 'teacher' ? 'Teacher' : 'Student'} ·{' '}
                        {user.accountStatus}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-base font-semibold text-[color:var(--primary)]">
                      {user.points.toLocaleString()}
                    </p>
                    <p className="text-xs text-[#8195af]">
                      {user.clubCount} clubs
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="dashboard-entrance dashboard-entrance-delay-4 mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.95fr)_minmax(340px,0.9fr)]">
          <article className={panelClass}>
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <BadgeAlert className="h-4 w-4 text-[color:var(--primary)]" />
                  <p className="text-lg font-semibold text-[#183153]">
                    Club requests
                  </p>
                </div>
                <p className="mt-2 text-sm text-[#6c829f]">
                  Requests are reviewed against the interest threshold before a
                  club can go live.
                </p>
              </div>

              <StatusBadge type="review" text="review mode" />
            </div>

            <div className="overflow-hidden rounded-[26px] border border-[color:var(--border)] bg-[color:var(--surface-strong)]">
              <div className="grid grid-cols-[1.2fr_0.95fr_0.8fr_0.8fr] gap-4 border-b border-[color:var(--border)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#7f93b1]">
                <span>Club</span>
                <span>Interest</span>
                <span>Status</span>
                <span className="text-right">Action</span>
              </div>

              <div className="divide-y divide-[#e7eef9]">
                {requests.map((club) => {
                  const thresholdReached = club.interestCount >= thresholdGoal;

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
                            ? 'approved'
                            : club.requestStatus === 'rejected'
                            ? 'rejected'
                            : thresholdReached
                            ? 'ready'
                            : 'below threshold'
                        }
                      />

                      <div className="flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => void rejectRequest(club.id)}
                          disabled={
                            club.requestStatus !== 'pending' || isSaving
                          }
                          className="rounded-full px-3 py-2 text-sm font-semibold text-[#ff5c5c] transition hover:bg-[#fff1f2] hover:text-[#e33f3f] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => void approveRequest(club.id)}
                          disabled={
                            club.requestStatus !== 'pending' || isSaving
                          }
                          className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(79,114,213,0.22)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#b5d0f3]"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </article>

          <article className={panelClass}>
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-[color:var(--primary)]" />
              <p className="text-lg font-semibold text-[#183153]">
                System controls
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {[
                {
                  label: 'Create global event',
                  icon: CalendarDays,
                  action: () => setActiveSection('events'),
                  active: activeSection === 'events',
                },
                {
                  label: 'Manage users',
                  icon: Users,
                  action: () => setActiveSection('users'),
                  active: activeSection === 'users',
                },
                {
                  label: 'XP & badge settings',
                  icon: Trophy,
                  action: () => setActiveSection('clubs'),
                  active: activeSection === 'clubs',
                },
                {
                  label: 'Review flagged clubs',
                  icon: ShieldAlert,
                  action: () => setActiveSection('spam'),
                  active: activeSection === 'spam',
                },
              ].map((item, index) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={item.action}
                    aria-pressed={item.active}
                    className={`flex w-full items-center gap-3 rounded-full border px-4 py-3.5 text-left transition ${
                      item.active
                        ? 'border-[color:var(--primary)] bg-[color:var(--primary)] text-white shadow-[0_16px_28px_rgba(79,114,213,0.22)]'
                        : index === 3
                        ? 'border-[#ffd6d8] bg-white text-[#ff4b57] hover:bg-[#fff5f5]'
                        : 'border-[color:var(--border)] bg-white text-[#183153] hover:border-[#b8cef0] hover:bg-[color:var(--surface)]'
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        item.active
                          ? 'bg-white/15'
                          : index === 3
                          ? 'bg-[#fff1f2]'
                          : 'bg-[#eef4fb]'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                    </span>
                    <span className="text-sm font-semibold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </article>
        </section>

        <section
          className={`${panelClass} dashboard-entrance dashboard-entrance-delay-5 mt-6 rounded-[30px] border-[color:var(--border)] bg-[color:var(--card)] px-5 py-5`}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7c92b0]">
                Management sections
              </p>
              <h2 className="mt-2 text-[1.9rem] font-semibold tracking-tight text-[#183153]">
                One visual system for every admin task
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6d829f]">
                Switch between approvals, user access, club status, and spam
                cleanup without leaving the dashboard.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3">
              {sectionItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setActiveSection(item.key)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-[color:var(--primary)] text-white shadow-[0_14px_24px_rgba(79,114,213,0.2)]'
                        : 'border border-[color:var(--border)] bg-white text-[#5d7491] hover:bg-[color:var(--surface)]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        isActive
                          ? 'bg-white/15 text-white'
                          : 'bg-[#eef4fb] text-[#6b83a3]'
                      }`}
                    >
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {activeSection === 'requests' ? (
            <>
              <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)]">
                <section className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-soft">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7f93b1]">
                        Create request
                      </p>
                      <h3 className="mt-2 text-[1.15rem] font-semibold text-[#183153]">
                        New club request form
                      </h3>
                      <p className="mt-2 max-w-2xl text-[0.9rem] leading-6 text-[#6c829f]">
                        Fill this out when a teacher or admin wants to add a new
                        club to the approval queue.
                      </p>
                    </div>
                    <StatusBadge type="review" text="review mode" />
                  </div>

                  <form className="mt-5 space-y-5" onSubmit={onSubmit}>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="block">
                        <span className={inputLabelClass}>Club name</span>
                        <input
                          type="text"
                          value={form.clubName}
                          onChange={(event) =>
                            updateField('clubName', event.target.value)
                          }
                          placeholder="Example: English Club"
                          className={fieldClass}
                        />
                      </label>

                      <label className="block">
                        <span className={inputLabelClass}>Teacher</span>
                        <select
                          value={form.teacher}
                          onChange={(event) =>
                            updateField('teacher', event.target.value)
                          }
                          className={fieldClass}
                        >
                          {teacherOptions.map((teacher) => (
                            <option key={teacher} value={teacher}>
                              {teacher}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className={inputLabelClass}>Start date</span>
                        <input
                          type="date"
                          value={form.startDate}
                          onChange={(event) =>
                            updateField('startDate', event.target.value)
                          }
                          className={fieldClass}
                        />
                      </label>

                      <label className="block">
                        <span className={inputLabelClass}>End date</span>
                        <input
                          type="date"
                          value={form.endDate}
                          onChange={(event) =>
                            updateField('endDate', event.target.value)
                          }
                          className={fieldClass}
                        />
                      </label>

                      <label className="block">
                        <span className={inputLabelClass}>Allowed days</span>
                        <select
                          value={form.allowedDays}
                          onChange={(event) =>
                            updateField('allowedDays', event.target.value)
                          }
                          className={fieldClass}
                        >
                          {dayOptions.map((days) => (
                            <option key={days} value={days}>
                              {days}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className={inputLabelClass}>Grade range</span>
                        <select
                          value={form.gradeRange}
                          onChange={(event) =>
                            updateField('gradeRange', event.target.value)
                          }
                          className={fieldClass}
                        >
                          {gradeOptions.map((grade) => (
                            <option key={grade} value={grade}>
                              {grade}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block">
                        <span className={inputLabelClass}>Student cap</span>
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={form.studentLimit}
                          onChange={(event) =>
                            updateField('studentLimit', event.target.value)
                          }
                          className={fieldClass}
                        />
                      </label>

                      <label className="block">
                        <span className={inputLabelClass}>
                          Current interest
                        </span>
                        <input
                          type="number"
                          min="0"
                          max="99"
                          value={form.interestCount}
                          onChange={(event) =>
                            updateField('interestCount', event.target.value)
                          }
                          className={fieldClass}
                        />
                      </label>
                    </div>

                    <label className="block">
                      <span className={inputLabelClass}>Admin note</span>
                      <textarea
                        rows={4}
                        value={form.note}
                        onChange={(event) =>
                          updateField('note', event.target.value)
                        }
                        placeholder="Why this club matters, what to review, and any approval notes."
                        className={fieldClass}
                      />
                    </label>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="rounded-full bg-[color:var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(79,114,213,0.22)] transition hover:opacity-90"
                      >
                        Create request
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="rounded-full border border-[color:var(--border)] bg-white px-5 py-2.5 text-sm font-semibold text-[#56708f] transition hover:bg-[color:var(--surface)]"
                      >
                        Reset
                      </button>
                      <span className="text-sm text-[#6982a2]">
                        {form.clubName
                          ? `Ready to queue: ${form.clubName}`
                          : 'Start with a new club request'}
                      </span>
                    </div>
                  </form>
                </section>

                <aside className="space-y-5">
                  <section className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-soft">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7f93b1]">
                      Review notes
                    </p>
                    <h3 className="mt-2 text-[1.15rem] font-semibold text-[#183153]">
                      What the queue controls
                    </h3>
                    <div className="mt-4 space-y-3 text-sm text-[#60789a]">
                      <div className="rounded-[22px] bg-[color:var(--surface)] px-4 py-3.5 leading-6">
                        Approve or reject each pending club request from one
                        clean list.
                      </div>
                      <div className="rounded-[22px] bg-[color:var(--surface)] px-4 py-3.5 leading-6">
                        Promote accepted clubs from pending to active without
                        changing the layout.
                      </div>
                      <div className="rounded-[22px] bg-[color:var(--surface)] px-4 py-3.5 leading-6">
                        Check whether interest reaches the {thresholdGoal}{' '}
                        student threshold.
                      </div>
                    </div>
                  </section>

                  <section className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-soft">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7f93b1]">
                          Threshold
                        </p>
                        <h3 className="mt-2 text-[1.15rem] font-semibold text-[#183153]">
                          Interest progress
                        </h3>
                      </div>
                      <StatusBadge type="approved" text="ready check" />
                    </div>

                    <div className="mt-4 space-y-4">
                      {spotlightClubs.map((club) => (
                        <div
                          key={club.id}
                          className="rounded-[22px] bg-[color:var(--surface)] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-[#183153]">
                                {club.clubName}
                              </p>
                              <p className="text-xs text-[#7a8faa]">
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
                    New user
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-[#183153]">
                    Create managed account
                  </h3>
                  <p className="mt-2 text-sm text-[#6c829f]">
                    Use this form to add a student or teacher with the same
                    visual style as the rest of the admin console.
                  </p>
                </div>

                <div className="mt-6 space-y-4">
                  <label className="block">
                    <span className={inputLabelClass}>Name</span>
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
                    <span className={inputLabelClass}>Email</span>
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
                    <span className={inputLabelClass}>Role</span>
                    <select
                      value={userForm.role}
                      onChange={(event) =>
                        updateUserField('role', event.target.value)
                      }
                      className={fieldClass}
                    >
                      {userRoleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role === 'teacher' ? 'Teacher' : 'Student'}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block">
                    <span className={inputLabelClass}>Reason</span>
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
                    Add user
                  </button>
                  <button
                    type="button"
                    onClick={resetUserForm}
                    className="rounded-full border border-[color:var(--border)] bg-white px-5 py-2.5 text-sm font-semibold text-[#56708f] transition hover:bg-[color:var(--surface)]"
                  >
                    Reset
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
                            text={
                              user.role === 'teacher' ? 'teacher' : 'student'
                            }
                          />
                          <StatusBadge
                            type={user.accountStatus}
                            text={
                              user.accountStatus === 'active'
                                ? 'active'
                                : user.accountStatus === 'restricted'
                                ? 'restricted'
                                : 'banned'
                            }
                          />
                        </div>
                        <p className="mt-1 text-sm text-[#6f86a7]">
                          {user.email}
                        </p>
                      </div>
                      <div className="text-right text-xs text-[#6f86a7]">
                        <p>Last active</p>
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
                        ['Role', user.role],
                        ['Clubs', user.clubCount],
                        ['Status', user.accountStatus],
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
                          ? 'Make teacher'
                          : 'Make student'}
                      </button>
                      <button
                        type="button"
                        onClick={() => void toggleUserRestriction(user.id)}
                        disabled={isSaving}
                        className="rounded-full border border-[#e3c98a] bg-white px-4 py-2 text-xs font-semibold text-[#ae7922] transition hover:bg-[#fff8e8]"
                      >
                        {user.accountStatus === 'restricted'
                          ? 'Remove restriction'
                          : 'Restrict'}
                      </button>
                      <button
                        type="button"
                        onClick={() => void toggleUserBan(user.id)}
                        disabled={isSaving}
                        className="rounded-full border border-[#f4b5ba] bg-white px-4 py-2 text-xs font-semibold text-[#de4a58] transition hover:bg-[#fff6f7]"
                      >
                        {user.accountStatus === 'banned' ? 'Unban' : 'Ban'}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {activeSection === 'clubs' ? (
            <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                      text={club.clubStatus}
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
                      className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                    >
                      {club.clubStatus === 'active'
                        ? 'Pause club'
                        : 'Activate club'}
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
            </section>
          ) : null}

          {activeSection === 'spam' ? (
            <section className="mt-6 grid gap-4 md:grid-cols-2">
              {spamQueue.map((club) => (
                <article
                  key={club.id}
                  className="rounded-[28px] border border-[#ffd2d5] bg-[#fff7f8] p-5 shadow-soft"
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
                    <StatusBadge type="spam" text="flagged" />
                  </div>

                  <p className="mt-3 text-sm leading-6 text-[#60789a]">
                    {club.note}
                  </p>
                  <p className="mt-3 rounded-[22px] bg-white/90 p-3 text-sm leading-6 text-[#cc4d57] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                    {club.flaggedReason}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => void removeSpamClub(club.id)}
                      disabled={isSaving}
                      className="rounded-full bg-[#ff5c6b] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#e44757]"
                    >
                      Remove spam club
                    </button>
                    <span className="text-xs text-[#8a5c64]">
                      {club.createdBy}
                    </span>
                  </div>
                </article>
              ))}
            </section>
          ) : null}

          {activeSection === 'events' ? (
            <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <form
                className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-soft"
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleCreateEvent();
                }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-[color:var(--primary)]" />
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7f93b1]">
                      Шинэ event
                    </p>
                  </div>
                  <h3 className="mt-2 text-xl font-semibold text-[#183153]">
                    Сургуулийн event үүсгэх
                  </h3>
                  <p className="mt-2 text-sm text-[#6c829f]">
                    Event үүсгэхэд бүх хэрэглэгч автоматаар нэгддэг.
                  </p>
                </div>

                <div className="mt-6 space-y-4">
                  <label className="block">
                    <span className={inputLabelClass}>Event гарчиг</span>
                    <input
                      type="text"
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
                      value={eventForm.eventDate}
                      onChange={(e) =>
                        updateEventField('eventDate', e.target.value)
                      }
                      className={fieldClass}
                    />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className={inputLabelClass}>Эхлэх цаг</span>
                      <input
                        type="time"
                        value={eventForm.startTime}
                        onChange={(e) =>
                          updateEventField('startTime', e.target.value)
                        }
                        className={fieldClass}
                      />
                    </label>
                    <label className="block">
                      <span className={inputLabelClass}>Дуусах цаг</span>
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
                        updateEventField('description', e.target.value)
                      }
                      placeholder="Event-ийн дэлгэрэнгүй мэдээлэл..."
                      className={fieldClass}
                    />
                  </label>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={
                      isSaving || !eventForm.title || !eventForm.eventDate
                    }
                    className="rounded-full bg-[color:var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(79,114,213,0.22)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-[#b5d0f3]"
                  >
                    Event үүсгэж auto join хийх
                  </button>
                  <button
                    type="button"
                    onClick={resetEventForm}
                    className="rounded-full border border-[color:var(--border)] bg-white px-5 py-2.5 text-sm font-semibold text-[#56708f] transition hover:bg-[color:var(--surface)]"
                  >
                    Цэвэрлэх
                  </button>
                </div>
              </form>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[color:var(--primary)]" />
                  <p className="text-lg font-semibold text-[#183153]">
                    Бүх events ({events.length})
                  </p>
                </div>

                {events.length === 0 ? (
                  <div className="rounded-[28px] border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-10 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--primary-soft)]">
                      <CalendarDays className="h-6 w-6 text-[color:var(--primary)]" />
                    </div>
                    <p className="mt-4 font-semibold text-[#183153]">Event байхгүй байна</p>
                    <p className="mt-1 text-sm text-[#6982a2]">
                      Эхний event үүсгэхэд бүх хэрэглэгч автоматаар нэгдэнэ.
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

                      const nextStatusLabel =
                        event.status === 'upcoming'
                          ? 'Ongoing болгох'
                          : event.status === 'ongoing'
                          ? 'Completed болгох'
                          : 'Upcoming болгох';

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
                                {event.startTime ? ` · ${event.startTime}` : ''}
                                {event.location ? ` · ${event.location}` : ''}
                              </p>
                            </div>
                            <span
                              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}
                            >
                              {event.status}
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
                              onClick={() => void handleDeleteEvent(event.id)}
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
            </section>
          ) : null}

          {activeSection === 'leaderboard' ? (
            <section className="mt-6">
              <div className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-soft">
                <div className="mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4 text-[color:var(--primary)]" />
                  <h3 className="text-lg font-semibold text-[#183153]">XP Leaderboard</h3>
                </div>
                {leaderboard.length === 0 ? (
                  <p className="text-sm text-[#8a9ab7]">Одоогоор XP бүртгэл байхгүй байна.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[color:var(--border)] text-left text-xs font-semibold uppercase tracking-wider text-[#7f93b1]">
                          <th className="pb-2 pr-4">#</th>
                          <th className="pb-2 pr-4">Нэр</th>
                          <th className="pb-2 pr-4">И-мэйл</th>
                          <th className="pb-2 pr-4">XP</th>
                          <th className="pb-2">Badge</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.map((entry) => (
                          <tr key={entry.userId} className="border-b border-[color:var(--border)] last:border-0">
                            <td className="py-2 pr-4 font-bold text-[#4f72d5]">{entry.rank}</td>
                            <td className="py-2 pr-4 font-medium text-[#183153]">{entry.name}</td>
                            <td className="py-2 pr-4 text-[#6c829f]">{entry.email}</td>
                            <td className="py-2 pr-4 font-semibold text-[#183153]">{entry.totalXp}</td>
                            <td className="py-2 text-[#6c829f]">{entry.badgeCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          ) : null}

          {activeSection === 'badges' ? (
            <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <form
                className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-soft"
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const data = new FormData(form);
                  void handleCreateBadge({
                    name: String(data.get('name') ?? ''),
                    description: String(data.get('description') ?? ''),
                    icon: String(data.get('icon') ?? '🏅'),
                    xpThreshold: Number(data.get('xpThreshold') ?? 0),
                    eventCountThreshold: Number(data.get('eventCountThreshold') ?? 0),
                    clubCountThreshold: Number(data.get('clubCountThreshold') ?? 0),
                  });
                  form.reset();
                }}
              >
                <div className="mb-4 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-[color:var(--primary)]" />
                  <h3 className="text-lg font-semibold text-[#183153]">Шинэ badge үүсгэх</h3>
                </div>
                <div className="space-y-3">
                  <label className="block">
                    <span className={inputLabelClass}>Нэр</span>
                    <input name="name" required placeholder="Badge нэр" className={fieldClass} />
                  </label>
                  <label className="block">
                    <span className={inputLabelClass}>Тайлбар</span>
                    <input name="description" placeholder="Тайлбар" className={fieldClass} />
                  </label>
                  <label className="block">
                    <span className={inputLabelClass}>Icon (emoji)</span>
                    <input name="icon" defaultValue="🏅" className={fieldClass} />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <label className="block">
                      <span className={inputLabelClass}>XP босго</span>
                      <input name="xpThreshold" type="number" defaultValue="0" min="0" className={fieldClass} />
                    </label>
                    <label className="block">
                      <span className={inputLabelClass}>Event тоо</span>
                      <input name="eventCountThreshold" type="number" defaultValue="0" min="0" className={fieldClass} />
                    </label>
                    <label className="block">
                      <span className={inputLabelClass}>Клуб тоо</span>
                      <input name="clubCountThreshold" type="number" defaultValue="0" min="0" className={fieldClass} />
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="mt-2 rounded-full bg-[color:var(--primary)] px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
                  >
                    Badge үүсгэх
                  </button>
                </div>
              </form>

              <div className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-soft">
                <div className="mb-4 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-[color:var(--primary)]" />
                  <h3 className="text-lg font-semibold text-[#183153]">Badge жагсаалт</h3>
                </div>
                {badges.length === 0 ? (
                  <p className="text-sm text-[#8a9ab7]">Одоогоор badge байхгүй байна.</p>
                ) : (
                  <div className="space-y-3">
                    {badges.map((badge) => (
                      <article key={badge.id} className="flex items-center gap-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
                        <span className="text-2xl">{badge.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#183153]">{badge.name}</p>
                          <p className="text-xs text-[#6c829f] truncate">{badge.description}</p>
                          <p className="mt-1 text-xs text-[#8a9ab7]">
                            XP≥{badge.xpThreshold} · Event≥{badge.eventCountThreshold} · Клуб≥{badge.clubCountThreshold}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleDeleteBadge(badge.id)}
                          disabled={isSaving}
                          className="rounded-full border border-[#ffd2d5] bg-white px-3 py-1 text-xs font-semibold text-[#de4a58] transition hover:bg-[#fff6f7] disabled:opacity-40"
                        >
                          Устгах
                        </button>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>
          ) : null}
        </section>
      </div>
    </main>
    //fvbsfbyv
  );
}
