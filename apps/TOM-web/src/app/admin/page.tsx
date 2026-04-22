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

type AdminSection = 'requests' | 'users' | 'clubs' | 'spam';

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
  'w-full rounded-[18px] border border-[#d7e3f4] bg-[#f6faff] px-4 py-3 text-sm text-[#17304f] outline-none transition placeholder:text-[#8da1bc] focus:border-[#6ba7ee] focus:bg-white focus:ring-4 focus:ring-[#deecff]';

const panelClass =
  'rounded-[32px] border border-[#d8e6f7] bg-white/95 p-5 shadow-[0_18px_60px_rgba(24,58,112,0.08)] backdrop-blur';

const inputLabelClass = 'mb-2 block text-sm font-semibold text-[#5c7392]';

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>('requests');
  const {
    activeClubs,
    activeCount,
    approveRequest,
    form,
    handleCreate,
    handleCreateUser,
    pendingRequests,
    rejectRequest,
    removeSpamClub,
    requests,
    spamQueue,
    resetUserForm,
    thresholdGoal,
    thresholdReachedCount,
    resetForm,
    toggleClubStatus,
    toggleUserBan,
    toggleUserRestriction,
    updateUserField,
    updateUserRole,
    updateField,
    formatThresholdLabel,
    userForm,
    users,
  } = useAdminDashboard();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleCreate();
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
      count: users.length,
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
      count: spamQueue.length,
      icon: ShieldAlert,
    },
  ] as const;

  const summaryCards = [
    {
      label: 'Total users',
      value: users.length,
      delta: '+4.2%',
      icon: Users,
      tint: 'bg-[#6d89ee]',
      badge: 'bg-[#edf3ff] text-[#4f72d5]',
    },
    {
      label: 'Active clubs',
      value: activeCount,
      delta: `+${activeClubs.length}`,
      icon: ShieldCheck,
      tint: 'bg-[#52b8e8]',
      badge: 'bg-[#eaf8ff] text-[#1f95ca]',
    },
    {
      label: 'Pending reviews',
      value: pendingRequests.length,
      delta: `+${thresholdReachedCount}`,
      icon: CalendarDays,
      tint: 'bg-[#90b6ff]',
      badge: 'bg-[#eef4ff] text-[#4f77d6]',
    },
    {
      label: 'Flagged clubs',
      value: spamQueue.length,
      delta: `+${Math.max(1, spamQueue.length) * 9}%`,
      icon: ShieldAlert,
      tint: 'bg-[#58d0df]',
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
    pendingRequests.length * 8 + 22,
    activeClubs.length * 10 + 28,
    users.length * 2 + 34,
    thresholdReachedCount * 11 + 18,
    spamQueue.length * 12 + 16,
    requests.length * 5 + 24,
    activeCount * 12 + 26,
    pendingRequests.length * 6 + 42,
    thresholdReachedCount * 8 + 35,
    users.length * 3 + 39,
    spamQueue.length * 9 + 20,
    activeClubs.length * 7 + 48,
  ].map((value) => Math.min(92, Math.max(18, value)));

  const activityPath = activitySeries
    .map(
      (value, index) =>
        `${index === 0 ? 'M' : 'L'} ${(index / (activitySeries.length - 1)) * 100} ${
          100 - value
        }`
    )
    .join(' ');

  const activityArea = `${activityPath} L 100 100 L 0 100 Z`;

  const spotlightClubs = requests.slice(0, 3);
  const spotlightUsers = leaderboard.slice(0, 3);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(165,219,255,0.6),_transparent_38%),radial-gradient(circle_at_top_right,_rgba(170,199,255,0.35),_transparent_32%),linear-gradient(180deg,_#eef8ff_0%,_#f8fcff_46%,_#edf7ff_100%)]">
      <div className="absolute left-[-5rem] top-20 h-64 w-64 rounded-full bg-[#c5ebff]/50 blur-3xl" />
      <div className="absolute right-[-6rem] top-40 h-72 w-72 rounded-full bg-[#b8d6ff]/35 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-[#d7f5ff]/30 blur-3xl" />

      <div className="relative mx-auto max-w-[1440px] px-0 py-0 sm:px-4 lg:px-8">
        <header className="dashboard-entrance rounded-b-[36px] border border-[#d7e3f3] border-t-0 bg-white/95 px-4 py-3 shadow-none sm:px-5 sm:py-3.5 lg:px-8">
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex min-w-0 items-center gap-2 text-[#5f7697] sm:gap-2.5">
              <Link
                href="/"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-1.5 py-1 text-[0.78rem] font-medium transition hover:bg-[#eef6ff] hover:text-[#2e4e7e] sm:px-2 sm:text-[0.84rem]"
              >
                <ArrowLeft className="h-3 w-3" />
                Home
              </Link>
              <span className="h-5 w-px bg-[#d8e4f5]" />
              <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] bg-[#5f86ea] text-white shadow-[0_14px_28px_rgba(95,134,234,0.24)]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-[0.95rem] font-semibold tracking-tight text-[#15304e] sm:text-[1rem]">
                    Admin Panel
                  </h1>
                  <p className="text-[0.68rem] text-[#6781a3] sm:text-[0.72rem]">
                    Full system control
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eff7ff] px-3 py-1.5 text-[0.78rem] font-medium text-[#58708f] shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] sm:px-4 sm:text-[0.84rem]">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Online
              </span>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d7ebff] text-[0.84rem] font-semibold text-[#4f7ece] sm:h-10 sm:w-10">
                JD
              </span>
            </div>
          </div>
        </header>

        <section className="dashboard-entrance dashboard-entrance-delay-1 mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.label}
                className={`${panelClass} relative min-h-[168px] overflow-hidden`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.tint} text-white shadow-[0_14px_28px_rgba(91,137,227,0.22)]`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${card.badge}`}>
                    {card.delta}
                  </span>
                </div>

                <div className="mt-8">
                  <p className="text-3xl font-semibold tracking-tight text-[#16314f]">
                    {card.value}
                  </p>
                  <p className="mt-2 text-sm text-[#6a819f]">{card.label}</p>
                </div>
              </article>
            );
          })}
        </section>

        <section className="dashboard-entrance dashboard-entrance-delay-2 mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.95fr)_minmax(340px,0.9fr)]">
          <article className={`${panelClass} min-h-[430px]`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[#4b7fe0]">
                  <ChartColumnIncreasing className="h-4 w-4" />
                  <p className="text-sm font-semibold text-[#17304f]">
                    Platform activity
                  </p>
                </div>
                <p className="mt-2 text-sm text-[#6c829f]">
                  Club approvals, activity, and moderation signals for the last
                  12 months.
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-[#e8f2ff] px-4 py-2 text-sm font-semibold text-[#365f91]">
                Last 12 months
              </span>
            </div>

            <div className="mt-6 h-[300px] overflow-hidden rounded-[28px] border border-[#e3edf9] bg-[linear-gradient(180deg,_rgba(247,251,255,0.92),_rgba(255,255,255,0.94))] p-4">
              <div className="relative h-full">
                <div className="absolute inset-0 rounded-[24px] bg-[linear-gradient(180deg,_transparent_0%,_transparent_calc(100%-1px),_rgba(219,230,247,0.72)_calc(100%-1px))]" />
                <div className="absolute inset-0 grid grid-cols-12 items-end gap-2 px-2 pb-8">
                  {activitySeries.map((value, index) => (
                    <div
                      key={`${monthLabels[index]}-${value}`}
                      className="flex h-full flex-col justify-end"
                    >
                      <div
                        className="rounded-t-[18px] bg-[linear-gradient(180deg,_#6bb0f0_0%,_#99c8ff_52%,_#c8ddff_100%)] shadow-[0_12px_26px_rgba(88,134,221,0.22)]"
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
                    <linearGradient id="admin-chart-area" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6faef4" stopOpacity="0.34" />
                      <stop offset="100%" stopColor="#6faef4" stopOpacity="0.03" />
                    </linearGradient>
                    <linearGradient id="admin-chart-line" x1="0" y1="0" x2="1" y2="0">
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
              <Trophy className="h-4 w-4 text-[#4a89e3]" />
              <p className="text-lg font-semibold text-[#17304f]">Leaderboard</p>
            </div>

            <div className="mt-5 space-y-4">
              {spotlightUsers.map((user, index) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-4 rounded-[24px] bg-[#f8fbff] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
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
                      <p className="truncate font-semibold text-[#17304f]">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-[#6983a4]">
                        {user.role === 'teacher' ? 'Teacher' : 'Student'} ·{' '}
                        {user.accountStatus}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-base font-semibold text-[#4d95ef]">
                      {user.points.toLocaleString()}
                    </p>
                    <p className="text-xs text-[#8195af]">{user.clubCount} clubs</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="dashboard-entrance dashboard-entrance-delay-3 mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.95fr)_minmax(340px,0.9fr)]">
          <article className={panelClass}>
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <BadgeAlert className="h-4 w-4 text-[#4a89e3]" />
                  <p className="text-lg font-semibold text-[#17304f]">
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

            <div className="overflow-hidden rounded-[26px] border border-[#e1ebf8] bg-[#fbfdff]">
              <div className="grid grid-cols-[1.2fr_0.95fr_0.8fr_0.8fr] gap-4 border-b border-[#e1ebf8] px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#7f93b1]">
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
                      className="grid items-center gap-4 px-4 py-4 transition hover:bg-[#f8fbff] sm:grid-cols-[1.2fr_0.95fr_0.8fr_0.8fr]"
                    >
                      <div>
                        <p className="font-semibold text-[#17304f]">
                          {club.clubName}
                        </p>
                        <p className="mt-1 text-sm text-[#6f86a7]">
                          {club.teacher} · {club.gradeRange}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <CapacityBar current={club.interestCount} total={thresholdGoal} />
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
                          onClick={() => rejectRequest(club.id)}
                          disabled={club.requestStatus !== 'pending'}
                          className="rounded-full px-3 py-2 text-sm font-semibold text-[#ff5c5c] transition hover:bg-[#fff1f2] hover:text-[#e33f3f] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => approveRequest(club.id)}
                          disabled={club.requestStatus !== 'pending'}
                          className="rounded-full bg-[#4d95ef] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(77,149,239,0.24)] transition hover:bg-[#3f88e1] disabled:cursor-not-allowed disabled:bg-[#b5d0f3]"
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
              <Settings2 className="h-4 w-4 text-[#4a89e3]" />
              <p className="text-lg font-semibold text-[#17304f]">
                System controls
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {[
                {
                  label: 'Create global event',
                  icon: CalendarDays,
                  action: () => setActiveSection('requests'),
                  active: activeSection === 'requests',
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
                        ? 'border-[#4d95ef] bg-[#4d95ef] text-white shadow-[0_16px_28px_rgba(77,149,239,0.26)]'
                        : index === 3
                        ? 'border-[#ffd6d8] bg-white text-[#ff4b57] hover:bg-[#fff5f5]'
                        : 'border-[#dbe5f3] bg-white text-[#17304f] hover:border-[#b8cef0] hover:bg-[#f7fbff]'
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
          className={`${panelClass} dashboard-entrance dashboard-entrance-delay-4 mt-6 rounded-[30px] border-[#dce7f8] bg-white px-5 py-5`}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#7c92b0]">
                Management sections
              </p>
              <h2 className="mt-2 text-[1.9rem] font-semibold tracking-tight text-[#183255]">
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
                        ? 'bg-[#1f3150] text-white shadow-[0_14px_24px_rgba(23,48,79,0.2)]'
                        : 'border border-[#d8e4f2] bg-white text-[#5d7491] hover:bg-[#f7fbff]'
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
                <section className="rounded-[28px] border border-[#dbe7f8] bg-[#fbfdff] p-5 shadow-[0_14px_42px_rgba(24,58,112,0.06)]">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7f93b1]">
                        Create request
                      </p>
                      <h3 className="mt-2 text-[1.15rem] font-semibold text-[#17304f]">
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
                        <span className={inputLabelClass}>Current interest</span>
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
                        onChange={(event) => updateField('note', event.target.value)}
                        placeholder="Why this club matters, what to review, and any approval notes."
                        className={fieldClass}
                      />
                    </label>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="submit"
                        className="rounded-full bg-[#4d95ef] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(77,149,239,0.22)] transition hover:bg-[#3f88e1]"
                      >
                        Create request
                      </button>
                      <button
                        type="button"
                        onClick={resetForm}
                        className="rounded-full border border-[#d7e1ef] bg-white px-5 py-2.5 text-sm font-semibold text-[#56708f] transition hover:bg-[#f7fbff]"
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
                  <section className="rounded-[28px] border border-[#dbe7f8] bg-[#fbfdff] p-5 shadow-[0_14px_42px_rgba(24,58,112,0.06)]">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7f93b1]">
                      Review notes
                    </p>
                    <h3 className="mt-2 text-[1.15rem] font-semibold text-[#17304f]">
                      What the queue controls
                    </h3>
                    <div className="mt-4 space-y-3 text-sm text-[#60789a]">
                      <div className="rounded-[22px] bg-[#f7fbff] px-4 py-3.5 leading-6">
                        Approve or reject each pending club request from one
                        clean list.
                      </div>
                      <div className="rounded-[22px] bg-[#f7fbff] px-4 py-3.5 leading-6">
                        Promote accepted clubs from pending to active without
                        changing the layout.
                      </div>
                      <div className="rounded-[22px] bg-[#f7fbff] px-4 py-3.5 leading-6">
                        Check whether interest reaches the {thresholdGoal}{' '}
                        student threshold.
                      </div>
                    </div>
                  </section>

                  <section className="rounded-[28px] border border-[#dbe7f8] bg-[#fbfdff] p-5 shadow-[0_14px_42px_rgba(24,58,112,0.06)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7f93b1]">
                          Threshold
                        </p>
                        <h3 className="mt-2 text-[1.15rem] font-semibold text-[#17304f]">
                          Interest progress
                        </h3>
                      </div>
                      <StatusBadge type="approved" text="ready check" />
                    </div>

                    <div className="mt-4 space-y-4">
                      {spotlightClubs.map((club) => (
                        <div
                          key={club.id}
                          className="rounded-[22px] bg-[#f7fbff] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-[#17304f]">
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
                className="rounded-[28px] border border-[#dbe7f8] bg-[#fbfdff] p-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleCreateUser();
                }}
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7f93b1]">
                    New user
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-[#17304f]">
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
                    className="rounded-full bg-[#4d95ef] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(77,149,239,0.22)] transition hover:bg-[#3f88e1]"
                  >
                    Add user
                  </button>
                  <button
                    type="button"
                    onClick={resetUserForm}
                    className="rounded-full border border-[#d7e1ef] bg-white px-5 py-2.5 text-sm font-semibold text-[#56708f] transition hover:bg-[#f7fbff]"
                  >
                    Reset
                  </button>
                </div>
              </form>

              <div className="space-y-4">
                {users.map((user, index) => (
                  <article
                    key={user.id}
                    className={`rounded-[28px] border p-5 shadow-[0_14px_42px_rgba(24,58,112,0.06)] ${
                      user.accountStatus === 'banned'
                        ? 'border-[#ffd2d5] bg-[#fff7f8]'
                        : user.accountStatus === 'restricted'
                        ? 'border-[#ffe4b7] bg-[#fffaf0]'
                        : 'border-[#dbe7f8] bg-[#fbfdff]'
                    } ${index === 0 ? 'dashboard-entrance-delay-1' : ''}`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-[#17304f]">
                            {user.name}
                          </h3>
                          <StatusBadge
                            type={user.role}
                            text={user.role === 'teacher' ? 'teacher' : 'student'}
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
                        <p className="mt-1 text-sm text-[#6f86a7]">{user.email}</p>
                      </div>
                      <div className="text-right text-xs text-[#6f86a7]">
                        <p>Last active</p>
                        <p className="mt-1 font-semibold text-[#17304f]">
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
                          <p className="mt-1 text-sm font-medium text-[#17304f]">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          updateUserRole(
                            user.id,
                            user.role === 'student' ? 'teacher' : 'student'
                          )
                        }
                        className="rounded-full bg-[#4d95ef] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#3f88e1]"
                      >
                        {user.role === 'student' ? 'Make teacher' : 'Make student'}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleUserRestriction(user.id)}
                        className="rounded-full border border-[#e3c98a] bg-white px-4 py-2 text-xs font-semibold text-[#ae7922] transition hover:bg-[#fff8e8]"
                      >
                        {user.accountStatus === 'restricted'
                          ? 'Remove restriction'
                          : 'Restrict'}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleUserBan(user.id)}
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
                  className="rounded-[28px] border border-[#dbe7f8] bg-[#fbfdff] p-5 shadow-[0_14px_42px_rgba(24,58,112,0.06)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-[#17304f]">
                        {club.clubName}
                      </h3>
                      <p className="mt-1 text-sm text-[#6f86a7]">{club.teacher}</p>
                    </div>
                    <StatusBadge type={club.clubStatus} text={club.clubStatus} />
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
                      onClick={() => toggleClubStatus(club.id)}
                      className="rounded-full bg-[#17304f] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#10253d]"
                    >
                      {club.clubStatus === 'active'
                        ? 'Pause club'
                        : 'Activate club'}
                    </button>
                    <StatusBadge
                      type={
                        club.interestCount >= thresholdGoal ? 'approved' : 'pending'
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
                  className="rounded-[28px] border border-[#ffd2d5] bg-[#fff7f8] p-5 shadow-[0_14px_42px_rgba(24,58,112,0.06)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-[#17304f]">
                        {club.clubName}
                      </h3>
                      <p className="mt-1 text-sm text-[#6f86a7]">{club.teacher}</p>
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
                      onClick={() => removeSpamClub(club.id)}
                      className="rounded-full bg-[#ff5c6b] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#e44757]"
                    >
                      Remove spam club
                    </button>
                    <span className="text-xs text-[#8a5c64]">{club.createdBy}</span>
                  </div>
                </article>
              ))}
            </section>
          ) : null}
        </section>
      </div>
    </main>
  );
}
