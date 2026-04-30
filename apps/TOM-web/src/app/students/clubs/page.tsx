'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';

import { CapacityBar } from '@/app/_components';
import { useTomOptions } from '@/app/_hooks/useTomOptions';
import { useTomSession } from '@/app/_providers/tom-session-provider';
import type { Club, TomFormOptions } from '@/lib/tom-types';

type ClubRequestForm = {
  clubName: string;
  teacherName: string;
  startDate: string;
  endDate: string;
  allowedDays: string;
  gradeRange: string;
  studentLimit: string;
  note: string;
};

const fieldClass =
  'w-full rounded-[18px] border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm text-[color:var(--text)] outline-none transition placeholder:text-[#8aa0be] focus:border-[color:var(--primary)] focus:bg-white focus:ring-4 focus:ring-[color:var(--primary-soft)]';

const inputLabelClass = 'mb-2 block text-sm font-semibold text-[#5f7697]';

function createInitialForm(options: TomFormOptions): ClubRequestForm {
  return {
    clubName: '',
    teacherName: options.teachers[0] ?? '',
    startDate: '2025-09-01',
    endDate: '2025-12-20',
    allowedDays: options.allowedDays[0] ?? '',
    gradeRange: options.gradeRanges[0] ?? '',
    studentLimit: '12',
    note: '',
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

async function readJson<T>(response: Response) {
  const data = (await response.json().catch(() => null)) as
    | ({ error?: string } & T)
    | null;

  if (!response.ok) {
    throw new Error(
      data?.error || `Хүсэлт амжилтгүй боллоо (код: ${response.status}).`
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

type MembershipResponse = {
  joinedClubIds: string[];
  awardedBadges?: Array<{ badge: { icon: string; name: string } }>;
  gainedXp?: number;
};

export default function ClubsPage() {
  const { options } = useTomOptions();
  const { user } = useTomSession();

  const [clubs, setClubs] = useState<Club[]>([]);
  const [activeTab, setActiveTab] = useState<'mine' | 'other'>('mine');
  const [joinedClubIds, setJoinedClubIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingClubId, setPendingClubId] = useState('');
  const [banner, setBanner] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogError, setDialogError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<ClubRequestForm>(() =>
    createInitialForm(options)
  );

  useEffect(() => {
    setForm((current) => ({
      ...current,
      teacherName:
        current.teacherName || options.teachers[0] || current.teacherName,
      allowedDays:
        current.allowedDays || options.allowedDays[0] || current.allowedDays,
      gradeRange:
        current.gradeRange || options.gradeRanges[0] || current.gradeRange,
    }));
  }, [options.allowedDays, options.gradeRanges, options.teachers]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [clubData, membershipData] = await Promise.all([
          apiRequest<{ clubs: Club[] }>('/api/clubs?status=active'),
          apiRequest<MembershipResponse>('/api/club-memberships'),
        ]);
        if (!cancelled) {
          setClubs(clubData.clubs);
          setJoinedClubIds(membershipData.joinedClubIds);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            getErrorMessage(error, 'Клубуудын жагсаалтыг ачаалж чадсангүй.')
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, []);

  const joinedSet = useMemo(() => new Set(joinedClubIds), [joinedClubIds]);

  const myClubs = useMemo(
    () =>
      clubs
        .filter((club) => joinedSet.has(club.id))
        .sort((left, right) => left.name.localeCompare(right.name)),
    [clubs, joinedSet]
  );

  const otherClubs = useMemo(
    () =>
      clubs
        .filter((club) => !joinedSet.has(club.id))
        .sort((left, right) => left.name.localeCompare(right.name)),
    [clubs, joinedSet]
  );

  const displayedClubs = activeTab === 'mine' ? myClubs : otherClubs;

  const openDialog = () => {
    setDialogError('');
    setForm(createInitialForm(options));
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setDialogError('');
    setIsSubmitting(false);
  };

  const updateForm = (field: keyof ClubRequestForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const updateClubMemberCount = (clubId: string, delta: 1 | -1) => {
    setClubs((current) =>
      current.map((club) =>
        club.id === clubId
          ? { ...club, memberCount: Math.max(0, club.memberCount + delta) }
          : club
      )
    );
  };

  const joinClub = async (clubId: string) => {
    if (joinedSet.has(clubId)) return;

    setBanner('');
    setErrorMessage('');
    setPendingClubId(clubId);

    try {
      const data = await apiRequest<MembershipResponse>(
        '/api/club-memberships',
        {
          method: 'POST',
          body: JSON.stringify({ clubId }),
        }
      );
      setJoinedClubIds(data.joinedClubIds);
      updateClubMemberCount(clubId, 1);
      const badgeMessage = data.awardedBadges?.length
        ? ` Шинэ badge: ${data.awardedBadges
            .map((item) => `${item.badge.icon} ${item.badge.name}`)
            .join(', ')}`
        : '';
      setBanner(
        `Клубт амжилттай нэгдлээ. +${data.gainedXp ?? 0} XP.${badgeMessage}`
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Клубт нэгдэж чадсангүй.'));
    } finally {
      setPendingClubId('');
    }
  };

  const leaveClub = async (clubId: string) => {
    if (!joinedSet.has(clubId)) return;

    setBanner('');
    setErrorMessage('');
    setPendingClubId(clubId);

    try {
      const data = await apiRequest<MembershipResponse & { ok: true }>(
        '/api/club-memberships',
        {
          method: 'DELETE',
          body: JSON.stringify({ clubId }),
        }
      );
      setJoinedClubIds(data.joinedClubIds);
      updateClubMemberCount(clubId, -1);
      setBanner('Клубээс гарлаа.');
    } catch (error) {
      setErrorMessage(getErrorMessage(error, 'Клубээс гарч чадсангүй.'));
    } finally {
      setPendingClubId('');
    }
  };

  const handleSubmitRequest = async () => {
    const clubName = form.clubName.trim();
    if (!clubName) {
      setDialogError('Клубын нэрээ оруулна уу.');
      return;
    }

    setIsSubmitting(true);
    setDialogError('');
    setBanner('');
    setErrorMessage('');

    try {
      await apiRequest('/api/club-requests', {
        method: 'POST',
        body: JSON.stringify({
          clubName,
          teacher: form.teacherName,
          createdBy: user?.name ?? 'Сурагч',
          startDate: form.startDate,
          endDate: form.endDate,
          allowedDays: form.allowedDays,
          gradeRange: form.gradeRange,
          studentLimit: Number(form.studentLimit) || 12,
          interestCount: 0,
          note: form.note,
        }),
      });

      closeDialog();
      setBanner('Клуб үүсгэх хүсэлтийг админ руу илгээлээ.');
      setActiveTab('other');
    } catch (error) {
      setDialogError(getErrorMessage(error, 'Хүсэлтийг илгээж чадсангүй.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#e2eaf5] bg-white p-8 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-[#0f1f3d]">Клубууд</h1>

        <button
          type="button"
          onClick={openDialog}
          className="inline-flex items-center gap-2 rounded-2xl bg-[#1a3560] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(26,53,96,0.25)] transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Клуб үүсгэх
        </button>
      </div>

      {(banner || errorMessage) && (
        <div
          className={`mt-5 rounded-[20px] border px-5 py-3.5 text-sm ${
            errorMessage
              ? 'border-[#ffd2d5] bg-[#fff7f8] text-[#b23a49]'
              : 'border-[#c8e6c9] bg-[#f1f8f1] text-[#2e7d32]'
          }`}
        >
          {errorMessage || banner}
        </div>
      )}

      <div className="mt-5 inline-flex rounded-xl border border-[#e2eaf5] bg-white p-1">
        {(
          [
            { key: 'mine', label: 'Миний клубууд' },
            { key: 'other', label: 'Бусад клубууд' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${
              activeTab === tab.key
                ? 'bg-[#49a0e3] text-white shadow-sm'
                : 'text-black hover:text-[#0f1f3d]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="mt-6 text-sm text-[#6b7fa3]">Клубуудыг ачаалж байна...</p>
      ) : displayedClubs.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-[#e2eaf5] bg-white p-8 text-center">
          <p className="text-sm text-[#6b7fa3]">
            {activeTab === 'mine'
              ? 'Одоогоор таны нэгдсэн клуб алга байна.'
              : 'Одоогоор бусад клуб алга байна.'}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {displayedClubs.map((club) => {
            const isJoined = joinedSet.has(club.id);
            return (
              <div
                key={club.id}
                className="rounded-xl border border-[#e2eaf5] bg-white p-5 text-left transition-all hover:border-[#b8cef0]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-[#0f1f3d]">
                      {club.name}
                    </h3>
                    <p className="mt-1.5 text-sm text-[#6b7fa3]">
                      {club.teacherName || 'Тодорхойгүй багш'}
                    </p>
                  </div>

                  {isJoined ? (
                    <div className="flex items-center gap-2">
                      <span className="rounded-md border border-[#86c78a] px-2 py-0.5 text-xs font-semibold text-[#3a8a3e]">
                        Нэгдсэн
                      </span>
                      <button
                        type="button"
                        onClick={() => void leaveClub(club.id)}
                        disabled={pendingClubId === club.id}
                        className="rounded-full border border-[#e2eaf5] px-4 py-2 text-xs font-semibold text-[#4b6284] transition hover:bg-[#f4f8ff] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {pendingClubId === club.id ? 'Гарч байна...' : 'Гарах'}
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void joinClub(club.id)}
                      disabled={pendingClubId === club.id}
                      className="rounded-full bg-[#1a3560] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {pendingClubId === club.id ? 'Нэгдэж байна...' : 'Нэгдэх'}
                    </button>
                  )}
                </div>

                <div className="mt-4 space-y-2 text-sm text-[#60789a]">
                  {club.note ? <p>{club.note}</p> : null}
                  <p>
                    {club.allowedDays}
                    {club.gradeRange ? ` · ${club.gradeRange}` : ''}
                  </p>
                  {club.startDate && club.endDate ? (
                    <p>
                      {club.startDate} – {club.endDate}
                    </p>
                  ) : null}
                  <CapacityBar
                    current={club.interestCount}
                    total={club.studentLimit}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-6">
          <div className="w-full max-w-2xl rounded-[28px] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#e2eaf5] px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-[#183153]">
                  Клуб үүсгэх
                </h2>
                <p className="mt-1 text-sm text-[#6f86a7]">
                  Клубын мэдээллээ бөглөөд админд илгээнэ үү.
                </p>
              </div>
              <button
                type="button"
                onClick={closeDialog}
                className="rounded-full p-2 text-[#6f86a7] transition hover:bg-[#f4f7fb] hover:text-[#183153]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="px-6 py-5">
              {dialogError ? (
                <div className="mb-4 rounded-[18px] border border-[#ffd2d5] bg-[#fff7f8] px-4 py-3 text-sm text-[#b23a49]">
                  {dialogError}
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block md:col-span-2">
                  <span className={inputLabelClass}>Клубын нэр</span>
                  <input
                    type="text"
                    value={form.clubName}
                    onChange={(e) => updateForm('clubName', e.target.value)}
                    placeholder="Жишээ: Роботик клуб"
                    className={fieldClass}
                  />
                </label>

                <label className="block">
                  <span className={inputLabelClass}>Багш</span>
                  <select
                    value={form.teacherName}
                    onChange={(e) => updateForm('teacherName', e.target.value)}
                    className={fieldClass}
                  >
                    {options.teachers.length > 0 ? (
                      options.teachers.map((teacher) => (
                        <option key={teacher} value={teacher}>
                          {teacher}
                        </option>
                      ))
                    ) : (
                      <option value="">Сонгох боломжгүй</option>
                    )}
                  </select>
                </label>

                <label className="block">
                  <span className={inputLabelClass}>Сурагчийн дээд тоо</span>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={form.studentLimit}
                    onChange={(e) => updateForm('studentLimit', e.target.value)}
                    className={fieldClass}
                  />
                </label>

                <label className="block">
                  <span className={inputLabelClass}>Эхлэх огноо</span>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => updateForm('startDate', e.target.value)}
                    className={fieldClass}
                  />
                </label>

                <label className="block">
                  <span className={inputLabelClass}>Дуусах огноо</span>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => updateForm('endDate', e.target.value)}
                    className={fieldClass}
                  />
                </label>

                <label className="block">
                  <span className={inputLabelClass}>Өдрүүд</span>
                  <select
                    value={form.allowedDays}
                    onChange={(e) => updateForm('allowedDays', e.target.value)}
                    className={fieldClass}
                  >
                    {options.allowedDays.length > 0 ? (
                      options.allowedDays.map((days) => (
                        <option key={days} value={days}>
                          {days}
                        </option>
                      ))
                    ) : (
                      <option value="">Сонгох боломжгүй</option>
                    )}
                  </select>
                </label>

                <label className="block">
                  <span className={inputLabelClass}>Ангийн хүрээ</span>
                  <select
                    value={form.gradeRange}
                    onChange={(e) => updateForm('gradeRange', e.target.value)}
                    className={fieldClass}
                  >
                    {options.gradeRanges.length > 0 ? (
                      options.gradeRanges.map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))
                    ) : (
                      <option value="">Сонгох боломжгүй</option>
                    )}
                  </select>
                </label>

                <label className="block md:col-span-2">
                  <span className={inputLabelClass}>Тайлбар</span>
                  <textarea
                    rows={4}
                    value={form.note}
                    onChange={(e) => updateForm('note', e.target.value)}
                    placeholder="Клубын зорилго, хийх зүйлс, шаардлага..."
                    className={fieldClass}
                  />
                </label>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeDialog}
                  className="rounded-full border border-[color:var(--border)] bg-white px-5 py-2.5 text-sm font-semibold text-[#56708f] transition hover:bg-[color:var(--surface)]"
                >
                  Болих
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => void handleSubmitRequest()}
                  className="rounded-full bg-[color:var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(79,114,213,0.22)] transition hover:opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? 'Илгээж байна...' : 'Илгээх'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
