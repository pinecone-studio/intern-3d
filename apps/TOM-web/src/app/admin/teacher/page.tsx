'use client';

import { UserPlus, Users } from 'lucide-react';
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
  const { options } = useTomOptions();
  const {
    errorMessage,
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

  const activeList = activeRoster === 'teachers' ? teachers : students;
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
            onClick={() => void toggleUserBan(user.id)}
            disabled={isSaving}
            className="rounded-full border border-[#f4b5ba] bg-white px-3 py-1.5 text-xs font-semibold text-[#de4a58] transition hover:bg-[#fff6f7] disabled:opacity-50"
          >
            {user.accountStatus === 'banned' ? 'Хориг цуцлах' : 'Хориглох'}
          </button>
        </div>
      </article>
    );
  };

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

        <div className="min-h-0 space-y-4 overflow-y-auto pr-1">
          {isLoading ? (
            <div className="rounded-2xl border border-[color:var(--border)] bg-white p-6 text-center text-sm text-[#6f86a7]">
              Багш, сурагчийн мэдээллийг ачаалж байна...
            </div>
          ) : (
            <section className="overflow-hidden rounded-[28px] border border-[color:var(--border)] bg-[color:var(--card)] shadow-sm">
              <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-[color:var(--border)] bg-[color:var(--card)] px-4 py-4 backdrop-blur">
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
                </div>
              </div>

              <div className="p-4">
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
    </div>
  );
}
