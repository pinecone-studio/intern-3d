'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ShieldCheck, Users } from 'lucide-react';

import { ClubPostsFeed } from '@/app/_components/ClubPostsFeed';
import { useTomSession } from '@/app/_providers/tom-session-provider';
import type { Club, ClubPost, ClubPostComment } from '@/lib/tom-types';

type FeedPost = ClubPost & { comments: ClubPostComment[] };
type FeedResponse = { club: Club; posts: FeedPost[] };

async function readJson<T>(response: Response) {
  const data = (await response.json().catch(() => null)) as
    | ({ error?: string; details?: unknown } & T)
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

export default function StudentClubDetailPage() {
  const { user } = useTomSession();
  const params = useParams<{ clubId: string }>();
  const clubId = params.clubId;

  const [club, setClub] = useState<Club | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const pageTitle = useMemo(
    () => club?.name || 'Клуб дэлгэрэнгүй',
    [club]
  );

  useEffect(() => {
    let cancelled = false;
    if (!clubId) return;

    setIsLoading(true);
    setErrorMessage('');

    void apiRequest<FeedResponse>(`/api/clubs/${clubId}/posts`)
      .then((data) => {
        if (cancelled) return;
        setClub(data.club);
        setPosts(data.posts);
      })
      .catch((error) => {
        if (cancelled) return;
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Клуб ачааллж чадсангүй.'
        );
      })
      .finally(() => {
        if (cancelled) return;
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [clubId]);

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[#dce7f8] bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Link
              href="/students/clubs"
              className="inline-flex items-center gap-1 rounded-full border border-[#d7e4f4] bg-white px-3 py-1 text-xs font-semibold text-[#4a6080] transition hover:bg-[#eef4ff]"
            >
              <ChevronLeft className="h-4 w-4" />
              Буцах
            </Link>

            <h1 className="mt-3 truncate text-2xl font-bold text-[#0f1f3d]">
              {pageTitle}
            </h1>
            {club?.description ? (
              <p className="mt-2 text-sm text-[#6f86a7]">{club.description}</p>
            ) : null}

            {club ? (
              <div className="mt-3 space-y-1 text-xs text-[#6f86a7]">
                <p className="inline-flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {club.teacherName}
                </p>
                <p className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {club.allowedDays}
                  {club.gradeRange ? ` · ${club.gradeRange}` : ''}
                </p>
                <p className="inline-flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  {club.memberCount} / {club.studentLimit} гишүүн ·{' '}
                  {club.interestCount} сонирхол
                </p>
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl bg-[#eef4ff] px-4 py-3 text-xs font-semibold text-[#496da8]">
            {user?.name ? `${user.name} · Сурагч` : 'Сурагч'}
          </div>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-2xl border border-[#ffd2d5] bg-[#fff7f8] px-4 py-3 text-sm text-[#b23a49]">
            {errorMessage}
          </div>
        ) : null}
      </section>

      {isLoading ? (
        <div className="rounded-2xl border border-[#e2eaf5] bg-white p-8 text-sm text-[#6f86a7]">
          Ачааллж байна...
        </div>
      ) : (
        <ClubPostsFeed
          clubId={clubId}
          posts={posts}
          setPosts={setPosts}
          onError={setErrorMessage}
        />
      )}
    </div>
  );
}
