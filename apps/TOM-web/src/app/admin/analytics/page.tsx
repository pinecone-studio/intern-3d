'use client';

import {
  Activity,
  CalendarDays,
  ShieldAlert,
  ShieldCheck,
  Users,
} from 'lucide-react';

import { useTomOptions } from '@/app/_hooks/useTomOptions';

import { useAdminDashboard } from '../useAdminDashboard';

export default function AnalyticsPage() {
  const { options } = useTomOptions();
  const {
    activeClubs,
    errorMessage,
    events,
    isLoading,
    requests,
    spamQueue,
    summary,
    thresholdReachedCount,
    users,
  } = useAdminDashboard(options);

  const teacherCount = users.filter((user) => user.role === 'teacher').length;
  const restrictedUsers = users.filter(
    (user) => user.accountStatus === 'restricted'
  ).length;
  const bannedUsers = users.filter((user) => user.accountStatus === 'banned').length;
  const activeClubCount = activeClubs.filter(
    (club) => club.clubStatus === 'active'
  ).length;
  const pausedClubCount = activeClubs.length - activeClubCount;
  const upcomingEvents = events.filter((event) => event.status === 'upcoming').length;
  const totalEventParticipants = events.reduce(
    (total, event) => total + event.participantCount,
    0
  );
  const maxMetric = Math.max(
    summary.totalUsers,
    activeClubs.length,
    requests.length,
    events.length,
    1
  );

  const cards = [
    {
      label: 'Total users',
      value: summary.totalUsers,
      detail: `${teacherCount} teachers`,
      icon: Users,
      tint: 'bg-gradient-primary',
    },
    {
      label: 'Active clubs',
      value: activeClubCount,
      detail: `${pausedClubCount} paused`,
      icon: ShieldCheck,
      tint: 'bg-gradient-teacher',
    },
    {
      label: 'Pending requests',
      value: summary.pendingRequests,
      detail: `${thresholdReachedCount} ready`,
      icon: Activity,
      tint: 'bg-gradient-student',
    },
    {
      label: 'Flagged spam',
      value: spamQueue.length,
      detail: 'needs review',
      icon: ShieldAlert,
      tint: 'bg-gradient-admin',
    },
  ];

  const bars = [
    ['Users', summary.totalUsers],
    ['Clubs', activeClubs.length],
    ['Requests', requests.length],
    ['Events', events.length],
  ] as const;

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-[color:var(--primary)]" />
              <h1 className="text-2xl font-bold text-[#183153]">Analytics</h1>
            </div>
            <p className="mt-2 text-sm text-[#6c829f]">
              Live overview of users, clubs, requests, moderation, and events.
            </p>
          </div>
          <span className="rounded-full bg-[color:var(--primary-soft)] px-4 py-2 text-sm font-semibold text-[#365f91]">
            {isLoading ? 'Loading...' : 'Live data'}
          </span>
        </div>

        {errorMessage ? (
          <p className="mt-4 rounded-2xl border border-[#ffd2d5] bg-[#fff7f8] px-4 py-3 text-sm text-[#b23a49]">
            {errorMessage}
          </p>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.label}
              className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-soft"
            >
              <div className="flex items-start justify-between gap-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${card.tint} text-white`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-full bg-[color:var(--surface)] px-3 py-1 text-xs font-semibold text-[#5f7697]">
                  {card.detail}
                </span>
              </div>
              <p className="mt-8 text-3xl font-semibold text-[#183153]">
                {card.value}
              </p>
              <p className="mt-2 text-sm text-[#6a819f]">{card.label}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <article className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-soft">
          <h2 className="text-xl font-semibold text-[#183153]">
            Platform breakdown
          </h2>
          <div className="mt-6 space-y-5">
            {bars.map(([label, value]) => (
              <div key={label}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-[#183153]">{label}</span>
                  <span className="text-[#6c829f]">{value}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-[color:var(--surface)]">
                  <div
                    className="h-full rounded-full bg-[color:var(--primary)]"
                    style={{ width: `${Math.max(8, (value / maxMetric) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-soft">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-[color:var(--primary)]" />
            <h2 className="text-xl font-semibold text-[#183153]">
              Event health
            </h2>
          </div>
          <div className="mt-5 grid gap-3">
            {[
              ['Total events', events.length],
              ['Upcoming events', upcomingEvents],
              ['Participants', totalEventParticipants],
              ['Restricted users', restrictedUsers],
              ['Banned users', bannedUsers],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-2xl bg-[color:var(--surface)] px-4 py-3"
              >
                <span className="text-sm font-medium text-[#5f7697]">
                  {label}
                </span>
                <span className="font-semibold text-[#183153]">{value}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
