'use client';

import { Trash2, UserPlus, Users } from 'lucide-react';
import { useState } from 'react';

import { StatusBadge } from '@/app/_components';
import { useTomOptions } from '@/app/_hooks/useTomOptions';

import type { ManagedUser } from '../admin-data';
import { useAdminDashboard } from '../useAdminDashboard';

const fieldClass =
  'w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--text)] outline-none transition placeholder:text-[#8aa0be] focus:border-[color:var(--primary)] focus:bg-white focus:ring-2 focus:ring-[color:var(--primary-soft)]';

const inputLabelClass = 'mb-1.5 block text-xs font-semibold text-[#5f7697]';

export default function AdminTeacherPage() {
  const [activeRoster, setActiveRoster] = useState<'teachers' | 'students'>(
    'teachers'
  );
  const [pendingBanUser, setPendingBanUser] = useState<ManagedUser | null>(
    null
  );
  const [pendingDeleteUser, setPendingDeleteUser] = useState<ManagedUser | null>(
    null
  );
  const [isBannedUsersOpen, setIsBannedUsersOpen] = useState(false);
  const { options } = useTomOptions();
  const {
    errorMessage,
    deleteUser,
    handleCreateUser,
    isLoading,
    isSaving,
    resetUserForm,
    toggleUserBan,
    toggleUserRestriction,
    updateUserField,
    updateUserRole,
    userForm,
    users,
  } = useAdminDashboard(options);

  const teachers = users.filter((user) => user.role === 'teacher');
  const students = users.filter((user) => user.role === 'student');
  const activeTeachers = teachers.filter(
    (teacher) => teacher.accountStatus === 'active'
  ).length;

  const bannedTeachers = teachers.filter(
    (teacher) => teacher.accountStatus === 'banned'
  );
  const bannedStudents = students.filter(
    (student) => student.accountStatus === 'banned'
  );

  const activeList =
    activeRoster === 'teachers'
      ? teachers.filter((teacher) => teacher.accountStatus !== 'banned')
      : students.filter((student) => student.accountStatus !== 'banned');
  const activeListTitle = activeRoster === 'teachers' ? 'Багш нар' : 'Сурагчид';
  const activeListDescription =
    activeRoster === 'teachers'
      ? 'Багшийн бүртгэл, түгжээс, эрхийг эндээс удирдана.'
      : 'Сурагчийн мэдээлэл, хязгаарлалт, хоригийг эндээс харна.';
  const activeListEmpty =
    activeRoster === 'teachers'
      ? 'Бүртгэлтэй багш одоогоор байхгүй байна.'
      : 'Бүртгэлтэй сурагч одоогоор байхгүй байна.';
  const activeListTargetRole =
    activeRoster === 'teachers' ? 'student' : 'teacher';
  const bannedCount = bannedTeachers.length + bannedStudents.length;

  const renderUserCard = (
    user: ManagedUser,
    targetRole: ManagedUser['role']
  ) => {
    const statusLabel =
      user.accountStatus === 'active'
        ? 'Идэвхтэй'
        : user.accountStatus === 'restricted'
        ? 'Хязгаарласан'
        : 'Хориглосон';

    const primaryActionLabel =
      targetRole === 'teacher' ? 'Багш болгох' : 'Сурагч болгох';

    return (
      <article
        key={user.id}
        className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] px-4 py-3 shadow-sm"
      >
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-base font-semibold text-[#183153]">
                {user.name}
              </h3>
              <StatusBadge
                type={user.role}
                text={user.role === 'teacher' ? 'Багш' : 'Сурагч'}
              />
              <StatusBadge type={user.accountStatus} text={statusLabel} />
            </div>
            <p className="mt-0.5 truncate text-sm text-[#6f86a7]">
              {user.email}
            </p>
            <p className="mt-1 truncate text-sm text-[#60789a]">
              {user.reason}
            </p>
          </div>

          <div className="shrink-0 text-right text-xs text-[#6f86a7]">
            <p>Клубүүд</p>
            <p className="mt-0.5 text-base font-semibold text-[#183153]">
              {user.clubCount}
            </p>
          </div>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void updateUserRole(user.id, targetRole)}
            disabled={isSaving}
            className="rounded-full bg-[color:var(--primary)] px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {primaryActionLabel}
          </button>
          <button
            type="button"
            onClick={() => void toggleUserRestriction(user.id)}
            disabled={isSaving}
            className="rounded-full border border-[#e3c98a] bg-white px-3 py-1.5 text-xs font-semibold text-[#ae7922] transition hover:bg-[#fff8e8] disabled:opacity-50"
          >
            {user.accountStatus === 'restricted'
              ? 'Хязгаарлалтыг авах'
              : 'Хязгаарлах'}
          </button>
          <button
            type="button"
            onClick={() => setPendingBanUser(user)}
            disabled={isSaving}
            className="rounded-full border border-[#f4b5ba] bg-white px-3 py-1.5 text-xs font-semibold text-[#de4a58] transition hover:bg-[#fff6f7] disabled:opacity-50"
          >
            {user.accountStatus === 'banned' ? 'Хориг цуцлах' : 'Хориглох'}
          </button>
        </div>
      </article>
    );
  };

  const renderBannedUserCard = (user: ManagedUser) => (
    <article
      key={user.id}
      className="rounded-[22px] border border-[#f3d5d8] bg-white/95 px-4 py-3 shadow-[0_10px_30px_rgba(221,76,93,0.06)] backdrop-blur"
    >
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-[#183153]">
              {user.name}
            </h3>
            <StatusBadge
              type={user.role}
              text={user.role === 'teacher' ? 'Багш' : 'Сурагч'}
            />
            <StatusBadge type="banned" text="Хориглосон" />
          </div>
          <p className="mt-0.5 truncate text-sm text-[#6f86a7]">{user.email}</p>
          <p className="mt-1 whitespace-pre-wrap break-words text-sm text-[#60789a]">
            {user.reason}
          </p>
        </div>

        <div className="shrink-0 text-right text-xs text-[#6f86a7]">
          <p>Сүүлд идэвхтэй</p>
          <p className="mt-0.5 text-base font-semibold text-[#183153]">
            {user.lastActive}
          </p>
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void toggleUserBan(user.id)}
          disabled={isSaving}
          className="rounded-full border border-[#f4b5ba] bg-white px-3 py-1.5 text-xs font-semibold text-[#de4a58] transition hover:bg-[#fff6f7] disabled:opacity-50"
        >
          Хориг цуцлах
        </button>
        <button
          type="button"
          onClick={() => setPendingDeleteUser(user)}
          disabled={isSaving}
          className="rounded-full border border-[#f0c1c1] bg-white px-3 py-1.5 text-xs font-semibold text-[#b8454f] transition hover:bg-[#fff5f5] disabled:opacity-50"
        >
          <span className="inline-flex items-center gap-1">
            <Trash2 className="h-3.5 w-3.5" />
            Устгах
          </span>
        </button>
      </div>
    </article>
  );

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-4 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[color:var(--primary)]" />
              <h1 className="text-xl font-bold text-[#183153]">
                Багшийн самбар
              </h1>
            </div>
            <p className="mt-1 text-sm text-[#6c829f]">
              Багшийн бүртгэл, эрх, төлөвийг нэг дороос удирдана.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              ['Багш', teachers.length],
              ['Идэвхтэй', activeTeachers],
              ['Сурагч', students.length],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl bg-[color:var(--surface)] px-3 py-2"
              >
                <p className="text-lg font-semibold text-[#183153]">{value}</p>
                <p className="text-xs text-[#6f86a7]">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {errorMessage ? (
          <p className="mt-3 rounded-xl border border-[#ffd2d5] bg-[#fff7f8] px-3 py-2 text-sm text-[#b23a49]">
            {errorMessage}
          </p>
        ) : null}
      </section>

      <section className="grid h-[min(620px,calc(100vh-220px))] min-h-[420px] gap-4 xl:grid-cols-[minmax(280px,0.7fr)_minmax(0,1.3fr)]">
        <form
          className="flex min-h-0 flex-col rounded-2xl border border-[color:var(--border)] bg-[color:var(--card)] p-4 shadow-sm"
          onSubmit={(event) => {
            event.preventDefault();
            void handleCreateUser();
          }}
        >
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-[color:var(--primary)]" />
            <h2 className="text-xl font-semibold text-[#183153]">
              Багш / сурагчийн бүртгэл нэмэх
            </h2>
          </div>

          <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
            <label className="block">
              <span className={inputLabelClass}>Нэр</span>
              <input
                type="text"
                value={userForm.name}
                onChange={(event) =>
                  updateUserField('name', event.target.value)
                }
                placeholder="Жишээ: Бат-Эрдэнэ багш"
                className={fieldClass}
              />
            </label>

            <label className="block">
              <span className={inputLabelClass}>Имэйл</span>
              <input
                type="email"
                value={userForm.email}
                onChange={(event) =>
                  updateUserField('email', event.target.value)
                }
                placeholder="teacher@example.edu"
                className={fieldClass}
              />
            </label>

            <label className="block">
              <span className={inputLabelClass}>Үүрэг</span>
              <select
                value={userForm.role}
                onChange={(event) =>
                  updateUserField('role', event.target.value)
                }
                className={fieldClass}
              >
                <option value="teacher">Багш</option>
                <option value="student">Сурагч</option>
              </select>
            </label>

            <label className="block">
              <span className={inputLabelClass}>Шалтгаан</span>
              <textarea
                rows={4}
                value={userForm.reason}
                onChange={(event) =>
                  updateUserField('reason', event.target.value)
                }
                placeholder="Жишээ: Сургалтын хөтөлбөрт багшийн бүртгэл нэмэх шаардлагатай."
                className={fieldClass}
              />
            </label>
          </div>

          <div className="mt-4 flex shrink-0 flex-wrap items-center gap-2 border-t border-[color:var(--border)] pt-3">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              Бүртгэл нэмэх
            </button>
            <button
              type="button"
              onClick={resetUserForm}
              className="rounded-full border border-[color:var(--border)] bg-white px-4 py-2 text-xs font-semibold text-[#56708f] transition hover:bg-[color:var(--surface)]"
            >
              Дахин тохируулах
            </button>
          </div>
        </form>

        <div className="min-h-0 flex flex-col gap-4">
          {isLoading ? (
            <div className="rounded-2xl border border-[color:var(--border)] bg-white p-6 text-center text-sm text-[#6f86a7]">
              Багш, сурагчийн мэдээллийг ачаалж байна...
            </div>
          ) : (
            <section className="flex min-h-0 flex-col overflow-hidden rounded-[28px] border border-[color:var(--border)] bg-[color:var(--card)] shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--border)] bg-[color:var(--card)] px-4 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#183153]">
                    {activeListTitle} ({activeList.length})
                  </h2>
                  <p className="text-sm text-[#6f86a7]">
                    {activeListDescription}
                  </p>
                </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveRoster('teachers')}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                      activeRoster === 'teachers'
                        ? 'bg-[color:var(--primary)] text-white'
                        : 'border border-[color:var(--border)] bg-white text-[#56708f] hover:bg-[color:var(--surface)]'
                    }`}
                  >
                    Багш
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveRoster('students')}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                      activeRoster === 'students'
                        ? 'bg-[color:var(--primary)] text-white'
                        : 'border border-[color:var(--border)] bg-white text-[#56708f] hover:bg-[color:var(--surface)]'
                    }`}
                  >
                    Сурагч
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsBannedUsersOpen(true)}
                    className="rounded-full border border-[#f4b5ba] bg-white px-4 py-2 text-xs font-semibold text-[#de4a58] shadow-sm transition hover:bg-[#fff6f7]"
                  >
                    Хориглосон дансууд ({bannedCount})
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-4">
                {activeList.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-6 text-center text-sm text-[#6f86a7]">
                    {activeListEmpty}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {activeList.map((user) =>
                      renderUserCard(user, activeListTargetRole)
                    )}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      </section>

      {pendingBanUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-[28px] bg-white shadow-xl">
            <div className="border-b border-[#e2eaf5] px-6 py-4">
              <h2 className="text-lg font-bold text-[#183153]">
                {pendingBanUser.accountStatus === 'banned'
                  ? 'Хориг цуцлах уу?'
                  : 'Хэрэглэгчийг хориглох уу?'}
              </h2>
              <p className="mt-1 text-sm text-[#6f86a7]">
                {pendingBanUser.accountStatus === 'banned'
                  ? `${pendingBanUser.name} дээрх хоригийг цуцалбал дахин ашиглах боломжтой болно.`
                  : `${pendingBanUser.name} дээрх хоригийг баталгаажуулбал тухайн хэрэглэгчийн эрх хаагдана.`}
              </p>
            </div>

            <div className="px-6 py-5">
              <div className="rounded-2xl border border-dashed border-[#d7e2ef] bg-[#f8fbff] p-4 text-sm text-[#60789a]">
                Үргэлжлүүлэх үү?
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPendingBanUser(null)}
                  className="rounded-full border border-[color:var(--border)] bg-white px-5 py-2.5 text-sm font-semibold text-[#56708f] transition hover:bg-[color:var(--surface)]"
                >
                  No
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={async () => {
                    const user = pendingBanUser;
                    setPendingBanUser(null);
                    if (!user) return;
                    await toggleUserBan(user.id);
                  }}
                  className="rounded-full bg-[color:var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(79,114,213,0.22)] transition hover:opacity-90 disabled:opacity-50"
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {isBannedUsersOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1730]/40 p-4 backdrop-blur-sm">
          <button
            type="button"
            aria-label="Close banned users dialog"
            className="absolute inset-0 cursor-default"
            onClick={() => setIsBannedUsersOpen(false)}
          />

          <div className="relative z-10 w-full max-w-6xl overflow-hidden rounded-[32px] border border-[#dbe6f5] bg-white shadow-[0_28px_80px_rgba(24,49,83,0.2)]">
            <div className="border-b border-[#e4edf8] bg-gradient-to-r from-[#fff8f9] via-white to-[#f9fbff] px-6 py-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-[#183153]">
                    Хориглосон дансууд ({bannedCount})
                  </h2>
                  <p className="mt-1 text-sm text-[#6f86a7]">
                    Хориглосон багш, сурагчдыг тусад нь харуулж, хэрэггүй бол
                    шууд устгана.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="rounded-full bg-[#fff6f7] px-3 py-1.5 text-xs font-semibold text-[#b8454f]">
                    Багш: {bannedTeachers.length}
                  </div>
                  <div className="rounded-full bg-[#fff6f7] px-3 py-1.5 text-xs font-semibold text-[#b8454f]">
                    Сурагч: {bannedStudents.length}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsBannedUsersOpen(false)}
                    className="rounded-full border border-[color:var(--border)] bg-white px-4 py-1.5 text-xs font-semibold text-[#56708f] transition hover:bg-[color:var(--surface)]"
                  >
                    Хаах
                  </button>
                </div>
              </div>
            </div>

            <div className="max-h-[min(78vh,760px)] overflow-y-auto p-4 md:p-5">
              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-[28px] border border-[#f4c5cc] bg-[#fffafb] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold text-[#183153]">
                      Хориглосон багш ({bannedTeachers.length})
                    </h3>
                    <Users className="h-4 w-4 text-[#de4a58]" />
                  </div>
                  <div className="mt-4 space-y-3">
                    {bannedTeachers.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-[#f0c1c1] bg-white p-5 text-center text-sm text-[#6f86a7]">
                        Хориглосон багш алга.
                      </div>
                    ) : (
                      bannedTeachers.map((user) => renderBannedUserCard(user))
                    )}
                  </div>
                </div>

                <div className="rounded-[28px] border border-[#f4c5cc] bg-[#fffafb] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold text-[#183153]">
                      Хориглосон сурагч ({bannedStudents.length})
                    </h3>
                    <Users className="h-4 w-4 text-[#de4a58]" />
                  </div>
                  <div className="mt-4 space-y-3">
                    {bannedStudents.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-[#f0c1c1] bg-white p-5 text-center text-sm text-[#6f86a7]">
                        Хориглосон сурагч алга.
                      </div>
                    ) : (
                      bannedStudents.map((user) => renderBannedUserCard(user))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {pendingDeleteUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-[28px] bg-white shadow-xl">
            <div className="border-b border-[#e2eaf5] px-6 py-4">
              <h2 className="text-lg font-bold text-[#183153]">
                Энэ дансыг устгах уу?
              </h2>
              <p className="mt-1 text-sm text-[#6f86a7]">
                {pendingDeleteUser.name}-ийн данс болон түүнтэй холбоотой session,
                клуб, бичлэгийн өгөгдөл устгагдана.
              </p>
            </div>

            <div className="px-6 py-5">
              <div className="rounded-2xl border border-dashed border-[#f3d5d8] bg-[#fffafb] p-4 text-sm text-[#60789a]">
                Энэ үйлдлийг буцаах боломжгүй.
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setPendingDeleteUser(null)}
                  className="rounded-full border border-[color:var(--border)] bg-white px-5 py-2.5 text-sm font-semibold text-[#56708f] transition hover:bg-[color:var(--surface)]"
                >
                  Буцах
                </button>
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={async () => {
                    const user = pendingDeleteUser;
                    setPendingDeleteUser(null);
                    if (!user) return;
                    await deleteUser(user.id);
                  }}
                  className="rounded-full bg-[#de4a58] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(222,74,88,0.22)] transition hover:opacity-90 disabled:opacity-50"
                >
                  Устгах
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
