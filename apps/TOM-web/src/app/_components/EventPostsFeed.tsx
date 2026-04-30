'use client';

import { Heart, Send } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';

import type { EventPost, EventPostComment } from '@/lib/tom-types';

type FeedPost = EventPost & { comments: EventPostComment[] };

type Props = {
  eventId: string;
  posts: FeedPost[];
  setPosts: Dispatch<SetStateAction<FeedPost[]>>;
  onError?: (message: string) => void;
};

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

function formatTimestamp(iso: string) {
  return iso ? iso.replace('T', ' ').slice(0, 16) : '';
}

export function EventPostsFeed({ eventId, posts, setPosts, onError }: Props) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [pendingCommentPostId, setPendingCommentPostId] = useState('');
  const [pendingLikePostId, setPendingLikePostId] = useState('');

  const submitComment = async (postId: string) => {
    const body = (drafts[postId] || '').trim();
    if (!body) return;

    setPendingCommentPostId(postId);
    onError?.('');

    try {
      const data = await apiRequest<{ comment: EventPostComment }>(
        `/api/events/${eventId}/posts/${postId}/comments`,
        {
          method: 'POST',
          body: JSON.stringify({ body }),
        }
      );

      setPosts((current) =>
        current.map((post) =>
          post.id === postId
            ? { ...post, comments: [...post.comments, data.comment] }
            : post
        )
      );
      setDrafts((current) => ({ ...current, [postId]: '' }));
    } catch (error) {
      onError?.(
        error instanceof Error ? error.message : 'Comment илгээж чадсангүй.'
      );
    } finally {
      setPendingCommentPostId('');
    }
  };

  const toggleLike = async (postId: string) => {
    if (pendingLikePostId) return;

    setPendingLikePostId(postId);
    onError?.('');

    try {
      const data = await apiRequest<{ likeCount: number; likedByMe: boolean }>(
        `/api/events/${eventId}/posts/${postId}/likes`,
        { method: 'POST' }
      );

      setPosts((current) =>
        current.map((post) =>
          post.id === postId
            ? { ...post, likeCount: data.likeCount, likedByMe: data.likedByMe }
            : post
        )
      );
    } catch (error) {
      onError?.(
        error instanceof Error ? error.message : 'Like дарж чадсангүй.'
      );
    } finally {
      setPendingLikePostId('');
    }
  };

  if (posts.length === 0) {
    return (
      <div className="rounded-2xl border border-[#e2eaf5] bg-white p-8 text-sm text-[#6f86a7]">
        Одоогоор энэ event дээр post байхгүй байна.
      </div>
    );
  }

  return (
    <section className="space-y-4">
      {posts.map((post) => {
        const draft = drafts[post.id] || '';
        const isSending = pendingCommentPostId === post.id;
        const isLiking = pendingLikePostId === post.id;

        return (
          <article
            key={post.id}
            className="rounded-[28px] border border-[#e2eaf5] bg-white p-5 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6f86a7]">
                  {post.author.name} · {post.author.role}
                </p>
                {post.title ? (
                  <h3 className="mt-1 text-lg font-semibold text-[#0f1f3d]">
                    {post.title}
                  </h3>
                ) : null}
              </div>
              <span className="rounded-full bg-[#f8fbff] px-3 py-1 text-xs font-semibold text-[#6f86a7]">
                {formatTimestamp(post.createdAt)}
              </span>
            </div>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#4a6080]">
              {post.body}
            </p>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => void toggleLike(post.id)}
                disabled={isLiking}
                className="inline-flex items-center gap-2 rounded-full border border-[#d7e4f4] bg-white px-4 py-2 text-xs font-semibold text-[#4a6080] transition hover:bg-[#eef4ff] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Heart
                  className={
                    post.likedByMe ? 'h-4 w-4 text-[#e11d48]' : 'h-4 w-4'
                  }
                  fill={post.likedByMe ? '#e11d48' : 'none'}
                />
                {post.likeCount}
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {post.comments.length ? (
                <div className="space-y-2">
                  {post.comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-2xl bg-[#f8fbff] px-4 py-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-[#183153]">
                          {comment.author.name}
                        </span>
                        <span className="text-[11px] font-semibold text-[#6f86a7]">
                          {formatTimestamp(comment.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-[#4a6080]">
                        {comment.body}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#6f86a7]">
                  Эхний comment бичээрэй.
                </p>
              )}

              <div className="flex items-end gap-2">
                <textarea
                  rows={2}
                  value={draft}
                  onChange={(e) =>
                    setDrafts((current) => ({
                      ...current,
                      [post.id]: e.target.value,
                    }))
                  }
                  placeholder="Comment бичих..."
                  className="w-full resize-none rounded-[18px] border border-[#d7e4f4] bg-[#f8fbff] px-4 py-3 text-sm text-[#17365f] outline-none placeholder:text-[#93a6c0] focus:border-[#1a3560]"
                />
                <button
                  type="button"
                  onClick={() => void submitComment(post.id)}
                  disabled={isSending || !draft.trim()}
                  className="inline-flex items-center gap-2 rounded-full bg-[#49a0e3] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send className="h-4 w-4" />
                  {isSending ? 'Илгээж байна...' : 'Илгээх'}
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
