'use client';

import { useEffect, useState } from 'react';

import type {
  Club as ApiClub,
  ClubRequest as ApiClubRequest,
  ManagedUser as ApiManagedUser,
  SchoolEvent as ApiEvent,
  TomFormOptions,
} from '@/lib/tom-types';

import {
  formatThresholdLabel,
  initialForm,
  initialUserForm,
  thresholdGoal,
  type ActiveClub,
  type ClubForm,
  type ClubRequest,
  type ManagedUser,
  type UserForm,
} from './admin-data';

type DashboardSummary = {
  totalUsers: number;
  activeClubs: number;
  pendingRequests: number;
  thresholdReachedRequests: number;
};

type DashboardSnapshot = {
  summary: DashboardSummary;
  requests: ClubRequest[];
  clubs: ActiveClub[];
  users: ManagedUser[];
  events: ApiEvent[];
};

const defaultBanner =
  'Cloudflare D1 дээрх бодит өгөгдлийг уншаад админ самбарыг синхрончиллоо.';

const emptySummary: DashboardSummary = {
  totalUsers: 0,
  activeClubs: 0,
  pendingRequests: 0,
  thresholdReachedRequests: 0,
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

async function readJson<T>(response: Response) {
  const data = (await response.json().catch(() => null)) as
    | ({ error?: string; details?: unknown } & T)
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

  const response = await fetch(input, {
    ...init,
    headers,
  });

  return readJson<T>(response);
}

function mapRequest(request: ApiClubRequest): ClubRequest {
  return {
    id: request.id,
    clubName: request.clubName,
    teacher: request.teacherName || 'Тодорхойгүй багш',
    createdBy: request.createdBy,
    interestCount: request.interestCount,
    studentLimit: request.studentLimit,
    gradeRange: request.gradeRange,
    allowedDays: request.allowedDays,
    startDate: request.startDate,
    endDate: request.endDate,
    note: request.note,
    requestStatus: request.requestStatus,
    clubStatus:
      request.clubStatus === 'active'
        ? 'active'
        : request.clubStatus === 'paused'
        ? 'paused'
        : 'pending',
    flaggedReason: request.flaggedReason ?? undefined,
  };
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

function mapUser(user: ApiManagedUser): ManagedUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    accountStatus: user.accountStatus,
    reason: user.reason,
    lastActive: user.lastActive,
    clubCount: user.clubCount,
    notes: user.notes,
  };
}

function formatEventStatusLabel(status: string) {
  switch (status) {
    case 'upcoming':
      return 'Удахгүй';
    case 'ongoing':
      return 'Явагдаж буй';
    case 'completed':
      return 'Дууссан';
    case 'cancelled':
      return 'Цуцлагдсан';
    default:
      return status;
  }
}

export type EventForm = {
  title: string;
  description: string;
  location: string;
  eventDate: string;
  startTime: string;
  endTime: string;
};

const initialEventForm: EventForm = {
  title: '',
  description: '',
  location: '',
  eventDate: '',
  startTime: '',
  endTime: '',
};

function createInitialClubForm(options: TomFormOptions): ClubForm {
  return {
    ...initialForm,
    teacher: options.teachers[0] ?? '',
    allowedDays: options.allowedDays[0] ?? '',
    gradeRange: options.gradeRanges[0] ?? '',
  };
}

export function useAdminDashboard(options: TomFormOptions) {
  const [form, setForm] = useState<ClubForm>(() => createInitialClubForm(options));
  const [userForm, setUserForm] = useState(initialUserForm);
  const [eventForm, setEventForm] = useState<EventForm>(initialEventForm);
  const [requests, setRequests] = useState<ClubRequest[]>([]);
  const [activeClubs, setActiveClubs] = useState<ActiveClub[]>([]);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [events, setEvents] = useState<ApiEvent[]>([]);
  const [summary, setSummary] = useState<DashboardSummary>(emptySummary);
  const [banner, setBanner] = useState(defaultBanner);
  const [errorMessage, setErrorMessage] = useState('');
  const [eventFormError, setEventFormError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const updateField = (field: keyof ClubForm, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(createInitialClubForm(options));
  };

  const updateUserField = (field: keyof UserForm, value: string) => {
    setUserForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetUserForm = () => {
    setUserForm(initialUserForm);
  };

  useEffect(() => {
    setForm((current) => ({
      ...current,
      teacher:
        current.teacher || options.teachers[0] || current.teacher,
      allowedDays:
        current.allowedDays || options.allowedDays[0] || current.allowedDays,
      gradeRange:
        current.gradeRange || options.gradeRanges[0] || current.gradeRange,
    }));
  }, [options.allowedDays, options.gradeRanges, options.teachers]);

  const loadDashboardSnapshot = async (): Promise<DashboardSnapshot> => {
    const [summaryData, requestData, clubData, userData, eventData] = await Promise.all([
      apiRequest<{ summary: DashboardSummary }>('/api/dashboard/summary'),
      apiRequest<{ requests: ApiClubRequest[] }>('/api/club-requests'),
      apiRequest<{ clubs: ApiClub[] }>('/api/clubs'),
      apiRequest<{ users: ApiManagedUser[] }>('/api/users'),
      apiRequest<{ events: ApiEvent[] }>('/api/events').catch(() => ({ events: [] })),
    ]);

    return {
      summary: summaryData.summary,
      requests: requestData.requests.map(mapRequest),
      clubs: clubData.clubs.map(mapClub),
      users: userData.users.map(mapUser),
      events: eventData.events,
    };
  };

  const applySnapshot = (snapshot: DashboardSnapshot, nextBanner?: string) => {
    setSummary(snapshot.summary);
    setRequests(snapshot.requests);
    setActiveClubs(snapshot.clubs);
    setUsers(snapshot.users);
    setEvents(snapshot.events);
    setBanner(nextBanner ?? defaultBanner);
  };

  const refreshDashboard = async (successMessage?: string) => {
    const snapshot = await loadDashboardSnapshot();
    applySnapshot(snapshot, successMessage);
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const snapshot = await loadDashboardSnapshot();

        if (!cancelled) {
          applySnapshot(snapshot);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(
            getErrorMessage(error, 'Админ самбарын өгөгдлийг ачаалж чадсангүй.')
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const runMutation = async (
    action: () => Promise<void>,
    fallbackError: string
  ) => {
    setIsSaving(true);
    setErrorMessage('');

    try {
      await action();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, fallbackError));
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
          teacher: form.teacher,
          createdBy: 'Админ самбар',
          startDate: form.startDate,
          endDate: form.endDate,
          allowedDays: form.allowedDays,
          gradeRange: form.gradeRange,
          studentLimit: Number(form.studentLimit) || 12,
          interestCount: Number(form.interestCount) || 0,
          note: form.note || 'Админ самбараас шинээр үүсгэсэн клубийн хүсэлт.',
          requestStatus: 'pending',
          clubStatus: 'pending',
        }),
      });

      setForm(createInitialClubForm(options));
      await refreshDashboard(`${clubName} шалгах дараалалд нэмэгдлээ.`);
    }, 'Шинэ клубийн хүсэлт үүсгэж чадсангүй.');
  };

  const handleCreateUser = async () => {
    const userName = userForm.name.trim() || 'Нэргүй хэрэглэгч';

    await runMutation(async () => {
      await apiRequest<{ user: ApiManagedUser }>('/api/users', {
        method: 'POST',
        body: JSON.stringify({
          name: userName,
          email: userForm.email,
          role: userForm.role,
          accountStatus: 'active',
          reason:
            userForm.reason || 'Админ самбараас шинээр бүртгэгдсэн хэрэглэгч.',
          lastActive: new Date().toISOString().slice(0, 10),
          clubCount: 0,
          notes: 'Шинэ бүртгэл.',
        }),
      });

      setUserForm(initialUserForm);
      await refreshDashboard(`${userName} хэрэглэгчийн бүртгэл нэмэгдлээ.`);
    }, 'Хэрэглэгч нэмж чадсангүй.');
  };

  const approveRequest = async (requestId: string) => {
    const request = requests.find((item) => item.id === requestId);
    if (!request) return;

    await runMutation(async () => {
      await apiRequest<{ request: ApiClubRequest; club: ApiClub }>(
        `/api/club-requests/${requestId}/approve`,
        { method: 'POST' }
      );
      await refreshDashboard(
        `${request.clubName} батлагдаж идэвхтэй төлөвт шилжлээ.`
      );
    }, 'Клубийн хүсэлтийг баталж чадсангүй.');
  };

  const rejectRequest = async (requestId: string) => {
    const request = requests.find((item) => item.id === requestId);
    if (!request) return;

    await runMutation(async () => {
      await apiRequest<{ request: ApiClubRequest }>(
        `/api/club-requests/${requestId}/reject`,
        { method: 'POST' }
      );
      await refreshDashboard(`${request.clubName} татгалзагдлаа.`);
    }, 'Клубийн хүсэлтийг татгалзаж чадсангүй.');
  };

  const toggleClubStatus = async (clubId: string) => {
    const club = activeClubs.find((item) => item.id === clubId);
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

      await refreshDashboard(
        nextStatus === 'active'
          ? `${club.clubName} дахин идэвхжлээ.`
          : `${club.clubName} түр зогсоосон төлөвт орлоо.`
      );
    }, 'Клубийн төлөв шинэчилж чадсангүй.');
  };

  const updateUserRole = async (userId: string, role: ManagedUser['role']) => {
    const user = users.find((item) => item.id === userId);
    if (!user) return;

    await runMutation(async () => {
      await apiRequest<{ user: ApiManagedUser }>(`/api/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          role,
          notes: `${role === 'teacher' ? 'Багшийн' : 'Сурагчийн'} эрхээр шинэчиллээ.`,
        }),
      });

      await refreshDashboard('Хэрэглэгчийн эрх шинэчлэгдлээ.');
    }, 'Хэрэглэгчийн эрх шинэчилж чадсангүй.');
  };

  const toggleUserRestriction = async (userId: string) => {
    const user = users.find((item) => item.id === userId);
    if (!user) return;

    const nextStatus =
      user.accountStatus === 'restricted' ? 'active' : 'restricted';
    const nextReason =
      nextStatus === 'active'
        ? 'Хязгаарлалт цуцлагдсан.'
        : 'Дүрмийн зөрчил шалгагдаж байна.';

    await runMutation(async () => {
      await apiRequest<{ user: ApiManagedUser }>(`/api/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          accountStatus: nextStatus,
          reason: nextReason,
        }),
      });

      await refreshDashboard('Хэрэглэгчийн хязгаарлалт шинэчлэгдлээ.');
    }, 'Хэрэглэгчийн хязгаарлалт шинэчилж чадсангүй.');
  };

  const toggleUserBan = async (userId: string) => {
    const user = users.find((item) => item.id === userId);
    if (!user) return;

    const nextStatus = user.accountStatus === 'banned' ? 'active' : 'banned';
    const nextReason =
      nextStatus === 'active'
        ? 'Блок тайлагдлаа.'
        : 'Админы шийдвэрээр түдгэлзүүллээ.';

    await runMutation(async () => {
      await apiRequest<{ user: ApiManagedUser }>(`/api/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          accountStatus: nextStatus,
          reason: nextReason,
        }),
      });

      await refreshDashboard('Хэрэглэгчийн түдгэлзүүлэлт шинэчлэгдлээ.');
    }, 'Хэрэглэгчийн түдгэлзүүлэлтийг шинэчилж чадсангүй.');
  };

  const deleteUser = async (userId: string) => {
    const user = users.find((item) => item.id === userId);
    if (!user) return;

    await runMutation(async () => {
      await apiRequest<{ ok: boolean }>(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      await refreshDashboard(`${user.name} хэрэглэгч устгагдлаа.`);
    }, 'Хэрэглэгч устгаж чадсангүй.');
  };

  const updateEventField = (field: keyof EventForm, value: string) => {
    setEventFormError('');
    setEventForm((current) => ({ ...current, [field]: value }));
  };

  const resetEventForm = () => {
    setEventForm(initialEventForm);
    setEventFormError('');
  };

  const handleCreateEvent = async () => {
    const title = eventForm.title.trim();
    const eventDate = eventForm.eventDate.trim();

    if (!title || !eventDate) {
      setEventFormError('Гарчиг болон огноо заавал оруулна уу.');
      return;
    }

    await runMutation(async () => {
      await apiRequest<{ event: ApiEvent }>('/api/events', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description: eventForm.description,
          location: eventForm.location,
          eventDate,
          startTime: eventForm.startTime,
          endTime: eventForm.endTime,
          createdBy: 'Админ самбар',
        }),
      });

      setEventForm(initialEventForm);
      await refreshDashboard(
        `"${title}" арга хэмжээ үүсэж, бүх хэрэглэгч автоматаар нэгдлээ.`
      );
    }, 'Арга хэмжээ үүсгэж чадсангүй.');
  };

  const handleDeleteEvent = async (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    await runMutation(async () => {
      await apiRequest<{ ok: boolean }>(`/api/events/${eventId}`, { method: 'DELETE' });
      await refreshDashboard(`"${event.title}" арга хэмжээ устгагдлаа.`);
    }, 'Арга хэмжээ устгаж чадсангүй.');
  };

  const handleToggleEventStatus = async (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    const nextStatus =
      event.status === 'upcoming' ? 'ongoing'
      : event.status === 'ongoing' ? 'completed'
      : 'upcoming';

    await runMutation(async () => {
      await apiRequest<{ event: ApiEvent }>(`/api/events/${eventId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus }),
      });

      await refreshDashboard(
        `"${event.title}" төлөв "${formatEventStatusLabel(nextStatus)}" боллоо.`
      );
    }, 'Арга хэмжээний төлөв шинэчилж чадсангүй.');
  };

  const handleCancelEvent = async (eventId: string) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    await runMutation(async () => {
      await apiRequest<{ event: ApiEvent }>(`/api/events/${eventId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'cancelled' }),
      });

      await refreshDashboard(`"${event.title}" арга хэмжээ цуцлагдлаа.`);
    }, 'Арга хэмжээ цуцалж чадсангүй.');
  };

  const pendingRequests = requests.filter(
    (request) => request.requestStatus === 'pending'
  );
  const activeCount = summary.activeClubs;
  const thresholdReachedCount = summary.thresholdReachedRequests;
  const canCreateEvent =
    Boolean(eventForm.title.trim()) && Boolean(eventForm.eventDate.trim()) && !isSaving;

  return {
    activeClubs,
    activeCount,
    approveRequest,
    banner,
    errorMessage,
    events,
    eventForm,
    eventFormError,
    form,
    handleCreate,
    handleCreateEvent,
    handleCancelEvent,
    handleCreateUser,
    handleDeleteEvent,
    handleToggleEventStatus,
    isLoading,
    isSaving,
    pendingRequests,
    rejectRequest,
    requests,
    resetEventForm,
    resetUserForm,
    summary,
    thresholdReachedCount,
    thresholdGoal,
    canCreateEvent,
    resetForm,
    updateEventField,
    updateUserField,
    toggleClubStatus,
    deleteUser,
    toggleUserBan,
    toggleUserRestriction,
    updateUserRole,
    userForm,
    users,
    updateField,
    formatThresholdLabel,
  };
}
