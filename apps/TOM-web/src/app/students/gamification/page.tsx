'use client';

import { useEffect, useState } from 'react';
import { Award, Sparkles } from 'lucide-react';

import { useTomSession } from '@/app/_providers/tom-session-provider';
import type { Badge, UserBadge, XpLog } from '@/lib/tom-types';

type XpResponse = {
  userId: string;
  total: number;
  logs: XpLog[];
};

type DashboardResponse = {
  badges: {
    earned: Array<UserBadge & { badge: Badge }>;
    total: number;
  };
};

async function readJson<T>(response: Response) {
  const data = (await response.json().catch(() => null)) as ({ error?: string } & T) | null;
  if (!response.ok) {
    throw new Error(data?.error || `Request failed: ${response.status}`);
  }
  return data as T;
}

export default function GamificationPage() {
  const { user } = useTomSession();
  const [xpTotal, setXpTotal] = useState(0);
  const [logs, setLogs] = useState<XpLog[]>([]);
  const [badges, setBadges] = useState<Array<UserBadge & { badge: Badge }>>([]);
  const [totalBadges, setTotalBadges] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;

    setIsLoading(true);
    setErrorMessage('');

    void Promise.all([
      fetch(`/api/xp/${user.id}`).then((response) => readJson<XpResponse>(response)),
      fetch('/api/students/dashboard').then((response) => readJson<DashboardResponse>(response)),
    ])
      .then(([xpData, dashboardData]) => {
        if (cancelled) return;
        setXpTotal(xpData.total);
        setLogs(xpData.logs);
        setBadges(dashboardData.badges.earned);
        setTotalBadges(dashboardData.badges.total);
      })
      .catch((error) => {
        if (!cancelled) setErrorMessage(error instanceof Error ? error.message : 'Gamification өгөгдөл ачаалж чадсангүй.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-[28px] border border-[#dce7f8] bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2 text-[#183153]">
            <Sparkles className="h-5 w-5 text-[color:var(--primary)]" />
            <h2 className="text-lg font-semibold">Нийт XP</h2>
          </div>
          <p className="mt-4 text-2xl font-bold text-[#17304f]">{xpTotal}</p>
        </article>
        <article className="rounded-[28px] border border-[#dce7f8] bg-white p-5 shadow-soft">
          <div className="flex items-center gap-2 text-[#183153]">
            <Award className="h-5 w-5 text-[color:var(--primary)]" />
            <h2 className="text-lg font-semibold">Нээгдсэн badge</h2>
          </div>
          <p className="mt-4 text-2xl font-bold text-[#17304f]">{badges.length}/{totalBadges}</p>
        </article>
        <article className="rounded-[28px] border border-[#dce7f8] bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold text-[#183153]">Сүүлийн XP</h2>
          <p className="mt-4 text-2xl font-bold text-[#17304f]">{logs[0]?.amount ? `${logs[0].amount > 0 ? '+' : ''}${logs[0].amount}` : '0'}</p>
          <p className="mt-1 text-sm text-[#6f86a7]">{logs[0]?.reason || 'Сүүлийн өөрчлөлт алга.'}</p>
        </article>
      </section>

      {errorMessage ? (
        <div className="rounded-2xl border border-[#ffd2d5] bg-[#fff7f8] px-4 py-3 text-sm text-[#b23a49]">{errorMessage}</div>
      ) : null}

      <section className="grid gap-5 lg:grid-cols-2">
        <article className="rounded-[28px] border border-[#dce7f8] bg-white p-5 shadow-soft">
          <h3 className="text-lg font-semibold text-[#183153]">Badge collection</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {badges.map((item) => (
              <div key={item.id} className="rounded-2xl bg-[color:var(--surface)] px-4 py-3">
                <p className="text-sm font-semibold text-[#183153]">{item.badge.icon} {item.badge.name}</p>
                <p className="mt-1 text-xs text-[#6f86a7]">{item.badge.description || 'Тайлбаргүй badge'}</p>
              </div>
            ))}
            {!isLoading && badges.length === 0 ? (
              <p className="text-sm text-[#6f86a7]">Одоогоор badge нээгдээгүй байна.</p>
            ) : null}
          </div>
        </article>

        <article className="rounded-[28px] border border-[#dce7f8] bg-white p-5 shadow-soft">
          <h3 className="text-lg font-semibold text-[#183153]">XP log</h3>
          <div className="mt-4 space-y-2">
            {logs.slice(0, 20).map((log) => (
              <div key={log.id} className="rounded-2xl bg-[color:var(--surface)] px-4 py-3">
                <p className="text-sm font-semibold text-[#183153]">{log.amount > 0 ? '+' : ''}{log.amount} XP · {log.source}</p>
                <p className="mt-1 text-xs text-[#6f86a7]">{log.reason}</p>
              </div>
            ))}
            {!isLoading && logs.length === 0 ? (
              <p className="text-sm text-[#6f86a7]">XP log хоосон байна.</p>
            ) : null}
          </div>
        </article>
      </section>
    </div>
  );
}
