'use client';

import { useEffect, useMemo, useState } from 'react';
import { FileText, Save, Search } from 'lucide-react';

import { CapacityBar, StatusBadge } from '@/app/_components';
import { useTomOptions } from '@/app/_hooks/useTomOptions';
import type { Club, ClubStatus } from '@/lib/tom-types';

const clubStatusLabel: Record<ClubStatus, string> = {
  draft: 'Ноорог',
  pending: 'Хүлээгдэж буй',
  active: 'Идэвхтэй',
  paused: 'Түр зогссон',
  archived: 'Архивласан',
};

type EditableClub = {
  name: string;
  description: string;
  studentLimit: string;
  gradeRange: string;
  allowedDays: string;
  startDate: string;
  endDate: string;
  note: string;
  status: ClubStatus;
  category: string;
};

function toEditableClub(club: Club): EditableClub {
  return {
    name: club.name,
    description: club.description,
    studentLimit: String(club.studentLimit),
    gradeRange: club.gradeRange,
    allowedDays: club.allowedDays,
    startDate: club.startDate,
    endDate: club.endDate,
    note: club.note,
    status: club.status,
    category: club.category,
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
  const {
    options,
    isLoading: isOptionsLoading,
    errorMessage: optionsError,
  } = useTomOptions();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClubId, setSelectedClubId] = useState<string>('');
  const [draft, setDraft] = useState<EditableClub | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [message, setMessage] = useState(
    'Клубийн дэлгэрэнгүй мэдээллийг ачааллаа.'
  );

  const loadData = async (nextMessage?: string) => {
    const query = new URLSearchParams();
    if (searchTerm.trim()) {
      query.set('q', searchTerm.trim());
    }

    const suffix = query.toString() ? `?${query.toString()}` : '';
    const clubData = await apiRequest<{ clubs: Club[] }>(
      `/api/teacher/clubs${suffix}`
    );
    setClubs(clubData.clubs);

    setSelectedClubId((current) => {
      if (current && clubData.clubs.some((club) => club.id === current)) {
        return current;
      }

      return clubData.clubs[0]?.id ?? '';
    });

    setMessage(nextMessage || 'Клубийн дэлгэрэнгүй мэдээллийг шинэчиллээ.');
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
              : 'Клубийн дэлгэрэнгүй хуудсыг ачаалж чадсангүй.'
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
          studentLimit: Number(draft.studentLimit) || 0,
          gradeRange: draft.gradeRange,
          allowedDays: draft.allowedDays,
          startDate: draft.startDate,
          endDate: draft.endDate,
          note: draft.note,
          status: draft.status,
          category: draft.category,
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
                ? 'Синк алдаа'
                : isLoading
                ? 'Клубийн дэлгэрэнгүй ачаалж байна'
                : isSaving
                ? 'Клубийн дэлгэрэнгүй хадгалж байна'
                : 'Клубийн дэлгэрэнгүй'}
            </p>
            <p className="mt-1 text-sm">
              {optionsError ||
                errorMessage ||
                (isLoading
                  ? 'Сонголтууд болон клубийн дэлгэрэнгүйг ачаалж байна.'
                  : isOptionsLoading
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
              placeholder="Клуб хайх"
              className="w-36 bg-transparent outline-none placeholder:text-[#8aa0be]"
            />
          </label>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.4fr]">
        <article className="rounded-[32px] border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-[#49a0e3]" />
            <div>
              <h2 className="text-xl font-semibold text-[#17304f]">
                Клубийн жагсаалт
              </h2>
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
                      ? 'border-[#49a0e3] bg-[#edf4ff]'
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
                      text={clubStatusLabel[club.status]}
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
                      text={clubStatusLabel[draft.status]}
                    />
                    {selectedClub.verified ? (
                      <StatusBadge type="approved" text="Баталгаажсан" />
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-[#6e84a3]">
                    {selectedClub.createdBy} · шинэчилсэн:{' '}
                    {selectedClub.updatedAt}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => void saveClub()}
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 rounded-full bg-[#49a0e3] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  Өөрчлөлт хадгалах
                </button>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-[#f4f8fd] px-4 py-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-[#7d91ae]">
                    Багтаамжийн тойм
                  </p>
                  <CapacityBar
                    current={selectedClub.memberCount}
                    total={Number(draft.studentLimit) || 0}
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl bg-[#f4f8fd] px-4 py-4 text-sm text-[#5f7697]">
                    <p className="text-xs uppercase tracking-[0.14em] text-[#7d91ae]">
                      Сонирхсон
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[#17304f]">
                      {selectedClub.interestCount}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#f4f8fd] px-4 py-4 text-sm text-[#5f7697]">
                    <p className="text-xs uppercase tracking-[0.14em] text-[#7d91ae]">
                      Ангилал
                    </p>
                    <p className="mt-2 text-lg font-semibold text-[#17304f]">
                      {draft.category || 'ерөнхий'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-[#d8e4f4] bg-[#f8fbff] px-4 py-3 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7d91ae]">
                    Хариуцсан багш
                  </p>
                  <p className="mt-1 font-semibold text-[#17304f]">
                    {selectedClub.teacherName || 'Тодорхойгүй'}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#d8e4f4] bg-[#f8fbff] px-4 py-3 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7d91ae]">
                    Гишүүд
                  </p>
                  <p className="mt-1 font-semibold text-[#17304f]">
                    {selectedClub.memberCount}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#d8e4f4] bg-[#f8fbff] px-4 py-3 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7d91ae]">
                    Баталгаажуулалт
                  </p>
                  <p className="mt-1 font-semibold text-[#17304f]">
                    {selectedClub.verified ? 'Баталгаажсан' : 'Баталгаажаагүй'}
                  </p>
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
                  placeholder="Клубийн нэр"
                  className="rounded-2xl border border-[#d8e4f4] bg-white px-4 py-3 text-sm outline-none focus:border-[#88a9df]"
                />
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
                  {options.gradeRanges.map((grade) => (
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
                  {options.allowedDays.map((day) => (
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
                  placeholder="Сурагчийн дээд тоо"
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
                  placeholder="Ангилал"
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
                  {['draft', 'pending', 'active', 'paused', 'archived'].map(
                    (status) => (
                      <option key={status} value={status}>
                        {clubStatusLabel[status as ClubStatus]}
                      </option>
                    )
                  )}
                </select>
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
                placeholder="Тайлбар"
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
                placeholder="Багшийн тэмдэглэл"
                className="mt-4 w-full rounded-2xl border border-[#d8e4f4] bg-white px-4 py-3 text-sm outline-none focus:border-[#88a9df]"
              />
            </>
          )}
        </article>
      </section>
    </div>
  );
}
