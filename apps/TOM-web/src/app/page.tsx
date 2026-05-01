'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, Search, UserCheck, Users } from 'lucide-react';
import { PineconeLoading } from '@/app/_components';
import { useTomSession } from '@/app/_providers/tom-session-provider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ManagedUser } from '@/lib/tom-types';

type UsersResponse = {
  users: ManagedUser[];
};

function routeForRole(role: ManagedUser['role']) {
  switch (role) {
    case 'admin':
      return '/admin';

    case 'teacher':
      return '/teacher';

    default:
      return '/students';
  }
}

async function loadUsers(query = '') {
  const params = new URLSearchParams();

  if (query.trim()) {
    params.set('q', query.trim());
  }

  const response = await fetch(
    `/api/users${params.toString() ? `?${params.toString()}` : ''}`,
    {
      method: 'GET',

      credentials: 'same-origin',

      cache: 'no-store',
    }
  );

  const data = (await response.json().catch(() => null)) as
    | UsersResponse
    | { error?: string }
    | null;

  if (!response.ok) {
    const message =
      data &&
      typeof data === 'object' &&
      'error' in data &&
      typeof data.error === 'string'
        ? data.error
        : 'Failed to load users.';

    throw new Error(message);
  }

  return (data as UsersResponse).users;
}

export default function HomePage() {
  const router = useRouter();

  const { user, isLoading, isAuthenticating, errorMessage, clearError, login } =
    useTomSession();

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');

  useEffect(() => {
    if (isLoading) return;

    if (user) {
      router.replace(routeForRole(user.role));
    }
  }, [isLoading, router, user]);

  useEffect(() => {
    let isMounted = true;

    setIsUsersLoading(true);

    void loadUsers(searchQuery)
      .then((nextUsers) => {
        if (!isMounted) return;

        setUsers(nextUsers);

        setSelectedUserId((previousUserId) =>
          nextUsers.some((candidate) => candidate.id === previousUserId)
            ? previousUserId
            : nextUsers.find(
                (candidate) => candidate.accountStatus !== 'banned'
              )?.id ?? ''
        );

        setUsersError('');
      })

      .catch((error) => {
        if (!isMounted) return;

        setUsersError(
          error instanceof Error ? error.message : 'Failed to load users.'
        );
      })

      .finally(() => {
        if (!isMounted) return;

        setIsUsersLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [searchQuery]);

  const visibleUsers = users;

  const activeUsers = visibleUsers.filter(
    (candidate) => candidate.accountStatus === 'active'
  ).length;

  const selectedUser =
    visibleUsers.find((candidate) => candidate.id === selectedUserId) ?? null;

  async function handleLogin(userId: string) {
    clearError();

    try {
      const currentUser = await login(userId);

      if (currentUser) {
        router.push(routeForRole(currentUser.role));
      }
    } catch {
      // Error state is already handled by the provider.
    }
  }

  async function handleSelectedLogin() {
    if (!selectedUserId) return;

    await handleLogin(selectedUserId);
  }

  const combinedError = errorMessage || usersError;

  if (isLoading) {
    return <PineconeLoading />;
  }

  return (
    <main
      className="min-h-screen px-4 py-6 flex items-center"
      style={{
        backgroundImage:
          'radial-gradient(circle at top left, rgba(222,232,248,0.95), transparent 38%), linear-gradient(#d6e4fb 1px, transparent 1px), linear-gradient(90deg, #d6e4fb 1px, transparent 1px)',

        backgroundSize: 'auto, 40px 40px, 40px 40px',

        backgroundColor: '#eef4fb',
      }}
    >
      <div className="mx-auto grid h-fit max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex flex-col justify-center rounded-[32px] border border-[#dbe7f6] bg-white/85 p-8 shadow-[0_24px_70px_rgba(20,47,82,0.10)] backdrop-blur">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#49a0e3] text-white shadow-[0_16px_30px_rgba(22,52,95,0.24)]">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-[#49a0e3]">
            School Club Platform
          </h1>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                title: 'DB users',

                description: 'Users table дээрх бодит бүртгэлүүдийг ашиглана.',

                icon: Users,
              },
              {
                title: 'Search',

                description: 'Нэр эсвэл email-ээр нь шүүнэ.',

                icon: Search,
              },
              {
                title: 'One-click login',

                description: 'Нэг дарж session үүсгээд role page руу орно.',

                icon: UserCheck,
              },
            ].map(({ title, description, icon: Icon }) => (
              <article
                key={title}
                className="rounded-[24px] border border-[#dce8f8] bg-[#f7faff] p-4 shadow-[0_10px_24px_rgba(50,88,140,0.08)]"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#1a3560] shadow-[0_10px_22px_rgba(26,53,96,0.10)]">
                  <Icon className="h-5 w-5" />
                </div>

                <h2 className="mt-4 text-lg font-semibold text-[#17365f]">
                  {title}
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#6983a7]">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="flex flex-col justify-center rounded-[32px] border border-[#dbe7f6] bg-white p-8 shadow-[0_24px_70px_rgba(20,47,82,0.10)]">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-[#49a0e3]">
                Хэрэглэгчээр нэвтрэх
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#6e86a7]">
                {isUsersLoading
                  ? 'DB user-үүдийг ачаалж байна...'
                  : `Нийт ${visibleUsers.length} хэрэглэгч, ${activeUsers} active хэрэглэгч байна.`}
              </p>
            </div>
          </div>

          <label className="mt-6 block">
            <span className="text-sm font-semibold text-[#1c3d6a]">Хайх</span>

            <div className="mt-2 flex items-center gap-3 rounded-[18px] border border-[#d7e4f4] bg-[#f8fbff] px-4 py-3 focus-within:border-[#2e5aac] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#dce8ff]">
              <Search className="h-4 w-4 shrink-0 text-[#6e86a7]" />

              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Нэр эсвэл email"
                className="w-full bg-transparent text-sm text-[#17365f] outline-none placeholder:text-[#93a6c0]"
              />
            </div>
          </label>

          {combinedError ? (
            <div className="mt-5 rounded-2xl border border-[#ffd3d3] bg-[#fff5f5] px-4 py-3 text-sm text-[#b54747]">
              {combinedError}
            </div>
          ) : null}

          <label className="mt-6 block text-sm font-semibold text-[#1c3d6a]">
            Нэвтрэх хэрэглэгч
            <Select
              value={selectedUserId}
              onValueChange={setSelectedUserId}
              disabled={
                isUsersLoading || isAuthenticating || visibleUsers.length === 0
              }
            >
              <SelectTrigger className="mt-2 border-[#d7e4f4] bg-[#f8fbff] text-[#17365f] focus:border-[#2e5aac] focus:ring-[#dce8ff]">
                <SelectValue
                  placeholder={
                    isUsersLoading
                      ? 'Хэрэглэгч дуудаж байна...'
                      : 'Хэрэглэгч сонгоно уу'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {visibleUsers.map((candidate) => (
                  <SelectItem
                    key={candidate.id}
                    value={candidate.id}
                    disabled={candidate.accountStatus === 'banned'}
                  >
                    {candidate.name} · {candidate.role} ·{' '}
                    {candidate.accountStatus}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <button
            type="button"
            onClick={() => void handleSelectedLogin()}
            disabled={
              !selectedUserId ||
              isUsersLoading ||
              isAuthenticating ||
              isLoading ||
              selectedUser?.accountStatus === 'banned'
            }
            className="mt-4 inline-flex items-center justify-center rounded-[18px] bg-[#49a0e3] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1e3a6b] disabled:cursor-not-allowed disabled:bg-[#9eb1cd]"
          >
            {isAuthenticating
              ? 'Нэвтэрч байна...'
              : 'Сонгосон хэрэглэгчээр нэвтрэх'}
          </button>

          {selectedUser ? (
            <div className="mt-4 rounded-2xl border border-[#dde8f8] bg-[#f8fbff] px-4 py-3 text-sm text-[#5e7597]">
              <span className="font-semibold text-[#17365f]">
                {selectedUser.name}
              </span>

              {` · ${selectedUser.email} · ${selectedUser.role} · ${selectedUser.accountStatus}`}
            </div>
          ) : null}

          {!isUsersLoading && visibleUsers.length === 0 ? (
            <p className="mt-6 rounded-2xl border border-dashed border-[#d9e5f5] px-4 py-3 text-sm text-[#88a0be]">
              Тохирох хэрэглэгч олдсонгүй.
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
