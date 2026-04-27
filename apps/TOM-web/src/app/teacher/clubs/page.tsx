'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Search, ShieldCheck, XCircle } from 'lucide-react';

import { CapacityBar, StatusBadge } from '@/app/_components';
import { useTomOptions } from '@/app/_hooks/useTomOptions';
import type { Club, ClubRequest } from '@/lib/tom-types';

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

export default function ClubsPage() {
  const { options, isLoading: isOptionsLoading, errorMessage: optionsError } =
    useTomOptions();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [requests, setRequests] = useState<ClubRequest[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [message, setMessage] = useState(
    'Клубийн мэдээллийг D1-ээс ачааллаа.'
  );

  const loadData = async (nextMessage?: string) => {
    const query = new URLSearchParams();

    if (selectedTeacher !== 'all') {
      query.set('teacher', selectedTeacher);
    }

    if (searchTerm.trim()) {
      query.set('q', searchTerm.trim());
    }

    const suffix = query.toString() ? `?${query.toString()}` : '';

    const [clubData, requestData] = await Promise.all([
      apiRequest<{ clubs: Club[] }>(`/api/clubs${suffix}`),
      apiRequest<{ requests: ClubRequest[] }>(
        `/api/club-requests?requestStatus=pending${
          suffix ? `&${query.toString()}` : ''
        }`
      ),
    ]);

    setClubs(clubData.clubs);
    setRequests(requestData.requests);
    setMessage(nextMessage || 'Клубийн мэдээллийг шинэчиллээ.');
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
              : 'Багшийн клубийн хуудсыг ачаалж чадсангүй.'
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
  }, [selectedTeacher, searchTerm]);

  const runAction = async (action: () => Promise<void>, fallback: string) => {
    setIsSaving(true);
    setErrorMessage('');

    try {
      await action();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : fallback);
    } finally {
      setIsSaving(false);
    }
  };

  const approveRequest = async (request: ClubRequest) => {
    await runAction(async () => {
      await apiRequest(`/api/club-requests/${request.id}/approve`, {
        method: 'POST',
      });
      await loadData(`${request.clubName} хүсэлт батлагдлаа.`);
    }, 'Хүсэлт баталж чадсангүй.');
  };

  const rejectRequest = async (request: ClubRequest) => {
    await runAction(async () => {
      await apiRequest(`/api/club-requests/${request.id}/reject`, {
        method: 'POST',
      });
      await loadData(`${request.clubName} хүсэлт татгалзагдлаа.`);
    }, 'Хүсэлт татгалзаж чадсангүй.');
  };

  const toggleClubStatus = async (club: Club) => {
    const nextStatus = club.status === 'active' ? 'paused' : 'active';

    await runAction(async () => {
      await apiRequest(`/api/clubs/${club.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: nextStatus,
        }),
      });
      await loadData(
        nextStatus === 'active'
          ? `${club.name} дахин идэвхжлээ.`
          : `${club.name} түр зогсоолоо.`
      );
    }, 'Клубийн төлөв шинэчилж чадсангүй.');
  };

  const activeClubs = useMemo(
    () => clubs.filter((club) => club.status === 'active'),
    [clubs]
  );
  const pausedClubs = useMemo(
    () => clubs.filter((club) => club.status === 'paused'),
    [clubs]
  );
  const clubStatusLabel = (status: Club['status']) =>
    ({
      active: 'Идэвхтэй',
      paused: 'Түр зогссон',
      pending: 'Хүлээгдэж буй',
      draft: 'Ноорог',
      archived: 'Архивласан',
      spam: 'Спам',
    })[status] ?? status;

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
                ? 'Клубүүд ачаалж байна'
                : isSaving
                ? 'Өөрчлөлт хадгалж байна'
                : 'Багшийн клубүүд'}
            </p>
            <p className="mt-1 text-sm">
              {optionsError ||
                errorMessage ||
                (isLoading
                  ? 'Клубийн сонголт болон хүсэлтийн өгөгдлийг ачаалж байна.'
                  : isOptionsLoading
                  ? 'Клуб, хүсэлтийн өгөгдлийг ачаалж байна.'
                  : isSaving
                  ? 'Сүүлд хийсэн өөрчлөлтийг хадгалж байна.'
                  : message)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="rounded-full border border-[#d9e4f3] bg-white px-3 py-2 text-sm text-[#4a6080]">
              <span className="mr-2 font-semibold">Багш</span>
              <select
                value={selectedTeacher}
                onChange={(event) => setSelectedTeacher(event.target.value)}
                className="bg-transparent outline-none"
              >
                <option value="all">Бүх багш</option>
                {options.teachers.map((teacher) => (
                  <option key={teacher} value={teacher}>
                    {teacher}
                  </option>
                ))}
              </select>
            </label>
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
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            label: 'Нийт клуб',
            value: clubs.length,
            caption: 'Багшийн хэсэгт харагдаж буй клубүүд',
          },
          {
            label: 'Идэвхтэй клубүүд',
            value: activeClubs.length,
            caption: 'Одоогоор ажиллаж байгаа клубүүд',
          },
          {
            label: 'Хүлээгдэж буй хүсэлтүүд',
            value: requests.length,
            caption: 'Багшийн баталгаажуулалт хүлээж буй санал',
          },
        ].map((item) => (
          <article
            key={item.label}
            className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-soft"
          >
            <p className="text-sm font-semibold text-[#5f7697]">{item.label}</p>
            <p className="mt-3 text-3xl font-bold text-[#17304f]">{item.value}</p>
            <p className="mt-2 text-sm text-[#6e84a3]">{item.caption}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <article className="rounded-[32px] border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-[#17304f]">Удирдаж буй клубүүд</h2>
              <p className="mt-1 text-sm text-[#6e84a3]">
                Клубийн хүчин чадал, төлөв, багшийн мэдээллийг эндээс харж удирдана.
              </p>
            </div>
            <StatusBadge
              type={pausedClubs.length > 0 ? 'paused' : 'active'}
              text={
                pausedClubs.length > 0
                  ? `${pausedClubs.length} түр зогссон`
                  : 'Бүгд идэвхтэй'
              }
            />
          </div>

          <div className="mt-5 space-y-4">
            {clubs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#d6e1ef] px-4 py-10 text-center text-sm text-[#7d93b2]">
                Энэ шүүлт дээр клуб олдсонгүй.
              </div>
            ) : (
              clubs.map((club) => (
                <div
                  key={club.id}
                  className="rounded-[24px] border border-[#deebf7] bg-white/90 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold text-[#17304f]">
                          {club.name}
                        </h3>
                        <StatusBadge
                          type={club.status}
                          text={clubStatusLabel(club.status)}
                        />
                        {club.verified ? (
                          <StatusBadge type="approved" text="Баталгаажсан" />
                        ) : null}
                      </div>
                      <p className="mt-2 text-sm text-[#6e84a3]">
                        {club.teacherName} · {club.gradeRange || 'Анги заагаагүй'} ·{' '}
                        {club.allowedDays || 'Өдөр тохируулаагүй'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void toggleClubStatus(club)}
                      disabled={isSaving}
                      className="rounded-full border border-[#d8e4f4] px-4 py-2 text-sm font-semibold text-[#17304f] transition hover:bg-[#eef4ff] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {club.status === 'active' ? 'Клуб түр зогсоох' : 'Клуб идэвхжүүлэх'}
                    </button>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#7a90af]">
                        Багтаамж
                      </p>
                      <CapacityBar
                        current={club.memberCount}
                        total={club.studentLimit}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm text-[#5f7697]">
                      <div className="rounded-2xl bg-[#f4f8fd] px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.14em] text-[#7d91ae]">
                          Сонирхол
                        </p>
                        <p className="mt-1 text-lg font-semibold text-[#17304f]">
                          {club.interestCount}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-[#f4f8fd] px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.14em] text-[#7d91ae]">
                          Хугацаа
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[#17304f]">
                          {club.startDate || 'Тодорхойгүй'} - {club.endDate || 'Тодорхойгүй'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-[#526987]">
                    {club.note || club.description || 'Клубийн тайлбар хараахан байхгүй.'}
                  </p>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-[32px] border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-[#1a3560]" />
            <div>
              <h2 className="text-xl font-semibold text-[#17304f]">Хүлээгдэж буй саналууд</h2>
              <p className="mt-1 text-sm text-[#6e84a3]">
                Хүсэлтийг хурдан батлах эсвэл буцаах хэсэг.
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {requests.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#d6e1ef] px-4 py-10 text-center text-sm text-[#7d93b2]">
                Хүлээгдэж буй хүсэлт алга.
              </div>
            ) : (
              requests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-[24px] border border-[#deebf7] bg-white/90 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-[#17304f]">
                        {request.clubName}
                      </h3>
                      <p className="mt-1 text-sm text-[#6e84a3]">
                        {request.teacherName} · {request.createdBy}
                      </p>
                    </div>
                    <StatusBadge type="pending" text="Хүлээгдэж буй" />
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-[#5f7697]">
                    <div className="rounded-2xl bg-[#f4f8fd] px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-[#7d91ae]">
                        Хуваарь
                      </p>
                      <p className="mt-1 font-semibold text-[#17304f]">
                        {request.allowedDays} · {request.gradeRange}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#f4f8fd] px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-[#7d91ae]">
                        Сонирхсон сурагчид
                      </p>
                      <p className="mt-1 font-semibold text-[#17304f]">
                        {request.interestCount} / {request.studentLimit}
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-[#526987]">
                    {request.note || 'Нэмэлт тайлбаргүй.'}
                  </p>

                  <div className="mt-4 flex gap-3">
                    <button
                      type="button"
                      onClick={() => void approveRequest(request)}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 rounded-full bg-[#1a3560] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#24478a] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Батлах
                    </button>
                    <button
                      type="button"
                      onClick={() => void rejectRequest(request)}
                      disabled={isSaving}
                      className="inline-flex items-center gap-2 rounded-full border border-[#d8e4f4] px-4 py-2 text-sm font-semibold text-[#17304f] transition hover:bg-[#fff3f4] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" />
                      Татгалзах
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
