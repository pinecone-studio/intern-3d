'use client';

import { useEffect, useMemo, useState } from 'react';
import { FileText, Save, Search } from 'lucide-react';

import { CapacityBar, StatusBadge } from '@/app/_components';
import {
  dayOptions,
  gradeOptions,
  teacherOptions,
} from '@/app/admin/admin-data';
import type { Club, ClubStatus } from '@/lib/tom-types';

type EditableClub = {
  name: string;
  description: string;
  teacherName: string;
  studentLimit: string;
  memberCount: string;
  interestCount: string;
  gradeRange: string;
  allowedDays: string;
  startDate: string;
  endDate: string;
  note: string;
  status: ClubStatus;
  category: string;
  verified: boolean;
};

function toEditableClub(club: Club): EditableClub {
  return {
    name: club.name,
    description: club.description,
    teacherName: club.teacherName,
    studentLimit: String(club.studentLimit),
    memberCount: String(club.memberCount),
    interestCount: String(club.interestCount),
    gradeRange: club.gradeRange,
    allowedDays: club.allowedDays,
    startDate: club.startDate,
    endDate: club.endDate,
    note: club.note,
    status: club.status,
    category: club.category,
    verified: club.verified,
  };
}

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

export default function DetailPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClubId, setSelectedClubId] = useState<string>('');
  const [draft, setDraft] = useState<EditableClub | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [message, setMessage] = useState(
    'Teacher club detail page дэлгэрэнгүй мэдээллийг ачааллаа.'
  );

  const loadData = async (nextMessage?: string) => {
    const query = new URLSearchParams();
    if (searchTerm.trim()) {
      query.set('q', searchTerm.trim());
    }

    const suffix = query.toString() ? `?${query.toString()}` : '';
    const clubData = await apiRequest<{ clubs: Club[] }>(`/api/clubs${suffix}`);
    setClubs(clubData.clubs);

    setSelectedClubId((current) => {
      if (current && clubData.clubs.some((club) => club.id === current)) {
        return current;
      }

      return clubData.clubs[0]?.id ?? '';
    });

    setMessage(
      nextMessage || 'Teacher club detail page дэлгэрэнгүй мэдээллийг шинэчиллээ.'
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
              : 'Club detail page ачаалж чадсангүй.'
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
  }, [searchTerm]);

  const selectedClub = useMemo(
    () => clubs.find((club) => club.id === selectedClubId) ?? null,
    [clubs, selectedClubId]
  );

  useEffect(() => {
    if (selectedClub) {
      setDraft(toEditableClub(selectedClub));
    } else {
      setDraft(null);
    }
  }, [selectedClub]);

  const saveClub = async () => {
    if (!selectedClub || !draft) {
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      await apiRequest(`/api/clubs/${selectedClub.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: draft.name,
          description: draft.description,
          teacherName: draft.teacherName,
          studentLimit: Number(draft.studentLimit) || 0,
          memberCount: Number(draft.memberCount) || 0,
          interestCount: Number(draft.interestCount) || 0,
          gradeRange: draft.gradeRange,
          allowedDays: draft.allowedDays,
          startDate: draft.startDate,
          endDate: draft.endDate,
          note: draft.note,
          status: draft.status,
          category: draft.category,
          verified: draft.verified,
        }),
      });

      await loadData(`${draft.name} клубийн мэдээлэл хадгалагдлаа.`);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Клубийн мэдээлэл хадгалж чадсангүй.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <section
        className={`rounded-[28px] border px-5 py-4 shadow-soft ${
          errorMessage
            ? 'border-[#ffd2d5] bg-[#fff7f8] text-[#b23a49]'
            : 'border-[color:var(--border)] bg-white/90 text-[#56708f]'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em]">
              {errorMessage
                ? 'Sync error'
                : isLoading
                ? 'Loading club detail'
                : isSaving
                ? 'Saving club detail'
                : 'Club detail'}
            </p>
            <p className="mt-1 text-sm">
              {errorMessage ||
                (isLoading
                  ? 'Клубийн дэлгэрэнгүй мэдээллийг ачаалж байна.'
                  : isSaving
                  ? 'Клубийн өөрчлөлтийг хадгалж байна.'
                  : message)}
            </p>
          </div>
          <label className="flex items-center gap-2 rounded-full border border-[#d9e4f3] bg-white px-3 py-2 text-sm text-[#4a6080]">
            <Search className="h-4 w-4" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search clubs"
              className="w-36 bg-transparent outline-none placeholder:text-[#8aa0be]"
            />
          </label>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.4fr]">
        <article className="rounded-[32px] border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-[#1a3560]" />
            <div>
              <h2 className="text-xl font-semibold text-[#17304f]">Club list</h2>
              <p className="mt-1 text-sm text-[#6e84a3]">
                Засах клубээ эндээс сонгоно.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {clubs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#d6e1ef] px-4 py-10 text-center text-sm text-[#7d93b2]">
                Клуб олдсонгүй.
              </div>
            ) : (
              clubs.map((club) => (
                <button
                  key={club.id}
                  type="button"
                  onClick={() => setSelectedClubId(club.id)}
                  className={`w-full rounded-[24px] border px-4 py-4 text-left transition ${
                    selectedClubId === club.id
                      ? 'border-[#1a3560] bg-[#edf4ff]'
                      : 'border-[#deebf7] bg-white hover:border-[#bfd4f1]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-[#17304f]">
                        {club.name}
                      </p>
                      <p className="mt-1 text-sm text-[#6e84a3]">
                        {club.teacherName}
                      </p>
                    </div>
                    <StatusBadge
                      type={club.status}
                      text={club.status.toUpperCase()}
                    />
                  </div>
                </button>
              ))
            )}
          </div>
        </article>

        <article className="rounded-[32px] border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-soft">
          {!selectedClub || !draft ? (
            <div className="rounded-2xl border border-dashed border-[#d6e1ef] px-4 py-16 text-center text-sm text-[#7d93b2]">
              Засах клубээ сонгоно уу.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold text-[#17304f]">
                      {selectedClub.name}
                    </h2>
                    <StatusBadge
                      type={draft.status}
                      text={draft.status.toUpperCase()}
                    />
                    {draft.verified ? (
                      <StatusBadge type="approved" text="Verified" />
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-[#6e84a3]">
                    {selectedClub.createdBy} · updated {selectedClub.updatedAt}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void saveClub()}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-full bg-[#1a3560] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#24478a] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  Save changes
                </button>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-[#f4f8fd] px-4 py-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#7d91ae]">
                    Capacity overview
                  </p>
                  <CapacityBar
                    current={Number(draft.memberCount) || 0}
                    total={Number(draft.studentLimit) || 0}
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl bg-[#f4f8fd] px-4 py-4 text-sm text-[#5f7697]">
                    <p className="text-xs uppercase tracking-[0.14em] text-[#7d91ae]">
                      Interested
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[#17304f]">
                      {draft.interestCount}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#f4f8fd] px-4 py-4 text-sm text-[#5f7697]">
                    <p className="text-xs uppercase tracking-[0.14em] text-[#7d91ae]">
                      Category
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[#17304f]">
                      {draft.category || 'general'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <input
                  value={draft.name}
                  onChange={(event) =>
                    setDraft((current) =>
                      current
                        ? { ...current, name: event.target.value }
                        : current
                    )
                  }
                  placeholder="Club name"
                  className="rounded-2xl border border-[#d8e4f4] bg-white px-4 py-3 text-sm outline-none focus:border-[#88a9df]"
                />
                <select
                  value={draft.teacherName}
                  onChange={(event) =>
                    setDraft((current) =>
                      current
                        ? { ...current, teacherName: event.target.value }
                        : current
                    )
                  }
                  className="rounded-2xl border border-[#d8e4f4] bg-white px-4 py-3 text-sm outline-none focus:border-[#88a9df]"
                >
                  {teacherOptions.map((teacher) => (
                    <option key={teacher} value={teacher}>
                      {teacher}
                    </option>
                  ))}
                </select>
                <select
                  value={draft.gradeRange}
                  onChange={(event) =>
                    setDraft((current) =>
                      current
                        ? { ...current, gradeRange: event.target.value }
                        : current
                    )
                  }
                  className="rounded-2xl border border-[#d8e4f4] bg-white px-4 py-3 text-sm outline-none focus:border-[#88a9df]"
                >
                  {gradeOptions.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
                <select
                  value={draft.allowedDays}
                  onChange={(event) =>
                    setDraft((current) =>
                      current
                        ? { ...current, allowedDays: event.target.value }
                        : current
                    )
                  }
                  className="rounded-2xl border border-[#d8e4f4] bg-white px-4 py-3 text-sm outline-none focus:border-[#88a9df]"
                >
                  {dayOptions.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={draft.startDate}
                  onChange={(event) =>
                    setDraft((current) =>
                      current
                        ? { ...current, startDate: event.target.value }
                        : current
                    )
                  }
                  className="rounded-2xl border border-[#d8e4f4] bg-white px-4 py-3 text-sm outline-none focus:border-[#88a9df]"
                />
                <input
                  type="date"
                  value={draft.endDate}
                  onChange={(event) =>
                    setDraft((current) =>
                      current
                        ? { ...current, endDate: event.target.value }
                        : current
                    )
                  }
                  className="rounded-2xl border border-[#d8e4f4] bg-white px-4 py-3 text-sm outline-none focus:border-[#88a9df]"
                />
                <input
                  type="number"
                  min="0"
                  value={draft.studentLimit}
                  onChange={(event) =>
                    setDraft((current) =>
                      current
                        ? { ...current, studentLimit: event.target.value }
                        : current
                    )
                  }
                  placeholder="Student limit"
                  className="rounded-2xl border border-[#d8e4f4] bg-white px-4 py-3 text-sm outline-none focus:border-[#88a9df]"
                />
                <input
                  type="number"
                  min="0"
                  value={draft.memberCount}
                  onChange={(event) =>
                    setDraft((current) =>
                      current
                        ? { ...current, memberCount: event.target.value }
                        : current
                    )
                  }
                  placeholder="Member count"
                  className="rounded-2xl border border-[#d8e4f4] bg-white px-4 py-3 text-sm outline-none focus:border-[#88a9df]"
                />
                <input
                  type="number"
                  min="0"
                  value={draft.interestCount}
                  onChange={(event) =>
                    setDraft((current) =>
                      current
                        ? { ...current, interestCount: event.target.value }
                        : current
                    )
                  }
                  placeholder="Interest count"
                  className="rounded-2xl border border-[#d8e4f4] bg-white px-4 py-3 text-sm outline-none focus:border-[#88a9df]"
                />
                <input
                  value={draft.category}
                  onChange={(event) =>
                    setDraft((current) =>
                      current
                        ? { ...current, category: event.target.value }
                        : current
                    )
                  }
                  placeholder="Category"
                  className="rounded-2xl border border-[#d8e4f4] bg-white px-4 py-3 text-sm outline-none focus:border-[#88a9df]"
                />
                <select
                  value={draft.status}
                  onChange={(event) =>
                    setDraft((current) =>
                      current
                        ? {
                            ...current,
                            status: event.target.value as ClubStatus,
                          }
                        : current
                    )
                  }
                  className="rounded-2xl border border-[#d8e4f4] bg-white px-4 py-3 text-sm outline-none focus:border-[#88a9df]"
                >
                  {['draft', 'pending', 'active', 'paused', 'archived', 'spam'].map(
                    (status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    )
                  )}
                </select>
                <label className="flex items-center gap-3 rounded-2xl border border-[#d8e4f4] bg-white px-4 py-3 text-sm font-semibold text-[#17304f]">
                  <input
                    type="checkbox"
                    checked={draft.verified}
                    onChange={(event) =>
                      setDraft((current) =>
                        current
                          ? { ...current, verified: event.target.checked }
                          : current
                      )
                    }
                    className="h-4 w-4 rounded border-[#c0d1e8]"
                  />
                  Mark as verified
                </label>
              </div>

              <textarea
                value={draft.description}
                onChange={(event) =>
                  setDraft((current) =>
                    current
                      ? { ...current, description: event.target.value }
                      : current
                  )
                }
                rows={4}
                placeholder="Description"
                className="mt-4 w-full rounded-2xl border border-[#d8e4f4] bg-white px-4 py-3 text-sm outline-none focus:border-[#88a9df]"
              />
              <textarea
                value={draft.note}
                onChange={(event) =>
                  setDraft((current) =>
                    current ? { ...current, note: event.target.value } : current
                  )
                }
                rows={4}
                placeholder="Teacher notes"
                className="mt-4 w-full rounded-2xl border border-[#d8e4f4] bg-white px-4 py-3 text-sm outline-none focus:border-[#88a9df]"
              />
            </>
          )}
        </article>
      </section>
    </div>
  );
}
