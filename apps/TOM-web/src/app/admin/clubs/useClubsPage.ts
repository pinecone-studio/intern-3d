'use client';

import { useEffect, useState } from 'react';

import type { Club as ApiClub, ClubRequest as ApiClubRequest, TomFormOptions } from '@/lib/tom-types';

import { initialForm, type ActiveClub, type ClubForm } from '../admin-data';

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

function mapClub(club: ApiClub): ActiveClub {
  return {
    id: club.id,
    clubName: club.name,
    teacher: club.teacherName || 'Тодорхойгүй багш',
    createdBy: club.createdBy,
    interestCount: club.interestCount,
    studentLimit: club.studentLimit,
    memberCount: club.memberCount,
    gradeRange: club.gradeRange,
    allowedDays: club.allowedDays,
    startDate: club.startDate,
    endDate: club.endDate,
    note: club.note || club.description,
    requestStatus: 'approved',
    clubStatus: club.status === 'active' ? 'active' : 'paused',
  };
}

function createInitialForm(options: TomFormOptions): ClubForm {
  return {
    ...initialForm,
    teacherId: options.teacherOptions[0]?.id ?? '',
    allowedDays: options.allowedDays[0] ?? '',
    gradeRange: options.gradeRanges[0] ?? '',
  };
}

export function useClubsPage(options: TomFormOptions) {
  const [clubs, setClubs] = useState<ActiveClub[]>([]);
  const [form, setForm] = useState<ClubForm>(() => createInitialForm(options));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [banner, setBanner] = useState('');

  useEffect(() => {
    setForm((current) => ({
      ...current,
      teacherId:
        current.teacherId || options.teacherOptions[0]?.id || current.teacherId,
      allowedDays: current.allowedDays || options.allowedDays[0] || current.allowedDays,
      gradeRange: current.gradeRange || options.gradeRanges[0] || current.gradeRange,
    }));
  }, [options.teacherOptions, options.allowedDays, options.gradeRanges]);

  const loadClubs = async () => {
    const data = await apiRequest<{ clubs: ApiClub[] }>('/api/clubs');
    return data.clubs.map(mapClub);
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const loaded = await loadClubs();
        if (!cancelled) setClubs(loaded);
      } catch (error) {
        if (!cancelled) setErrorMessage(getErrorMessage(error, 'Клубийн жагсаалтыг ачаалж чадсангүй.'));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void run();
    return () => { cancelled = true; };
  }, []);

  const runMutation = async (action: () => Promise<void>, fallback: string) => {
    setIsSaving(true);
    setErrorMessage('');
    try {
      await action();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, fallback));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreate = async () => {
    const clubName = form.clubName.trim() || 'Нэргүй клуб';

    await runMutation(async () => {
      await apiRequest<{ request: ApiClubRequest }>('/api/club-requests', {
        method: 'POST',
        body: JSON.stringify({
          clubName,
          teacherId: form.teacherId,
          startDate: form.startDate,
          endDate: form.endDate,
          allowedDays: form.allowedDays,
          gradeRange: form.gradeRange,
          studentLimit: Number(form.studentLimit) || 12,
          interestCount: Number(form.interestCount) || 0,
          note: form.note || 'Админ самбараас шинээр үүсгэсэн клубийн хүсэлт.',
        }),
      });

      setForm(createInitialForm(options));
      setIsDialogOpen(false);
      const loaded = await loadClubs();
      setClubs(loaded);
      setBanner(`"${clubName}" хүсэлт шалгах дараалалд нэмэгдлээ.`);
    }, 'Клуб үүсгэж чадсангүй.');
  };

  const toggleClubStatus = async (clubId: string) => {
    const club = clubs.find((c) => c.id === clubId);
    if (!club) return;

    const nextStatus = club.clubStatus === 'active' ? 'paused' : 'active';

    await runMutation(async () => {
      await apiRequest<{ club: ApiClub }>(`/api/clubs/${clubId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: club.clubName,
          teacherName: club.teacher,
          createdBy: club.createdBy,
          interestCount: club.interestCount,
          studentLimit: club.studentLimit,
          memberCount: 0,
          gradeRange: club.gradeRange,
          allowedDays: club.allowedDays,
          startDate: club.startDate,
          endDate: club.endDate,
          note: club.note,
          description: club.note,
          status: nextStatus,
          category: 'general',
          verified: false,
        }),
      });

      const loaded = await loadClubs();
      setClubs(loaded);
      setBanner(
        nextStatus === 'active'
          ? `"${club.clubName}" дахин идэвхжлээ.`
          : `"${club.clubName}" түр зогсоосон төлөвт орлоо.`
      );
    }, 'Клубийн төлөв шинэчилж чадсангүй.');
  };

  const updateField = (field: keyof ClubForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const openDialog = () => {
    setForm(createInitialForm(options));
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setErrorMessage('');
  };

  return {
    clubs,
    form,
    isDialogOpen,
    isLoading,
    isSaving,
    errorMessage,
    banner,
    openDialog,
    closeDialog,
    updateField,
    handleCreate,
    toggleClubStatus,
  };
}
