'use client';

import { UserPlus, Users } from 'lucide-react';

import { StatusBadge } from '@/app/_components';
import { useTomOptions } from '@/app/_hooks/useTomOptions';

import { useAdminDashboard } from '../useAdminDashboard';

const fieldClass =
  'w-full rounded-[18px] border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm text-[color:var(--text)] outline-none transition placeholder:text-[#8aa0be] focus:border-[color:var(--primary)] focus:bg-white focus:ring-4 focus:ring-[color:var(--primary-soft)]';

const inputLabelClass = 'mb-2 block text-sm font-semibold text-[#5f7697]';

export default function AdminTeacherPage() {
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

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--card)] p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-[color:var(--primary)]" />
              <h1 className="text-2xl font-bold text-[#183153]">
                Teacher Panel
              </h1>
            </div>
            <p className="mt-2 text-sm text-[#6c829f]">
              Manage teacher accounts, permissions, and account status from one
              admin view.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              ['Teachers', teachers.length],
              ['Active', activeTeachers],
              ['Students', students.length],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl bg-[color:var(--surface)] px-4 py-3"
              >
                <p className="text-xl font-semibold text-[#183153]">{value}</p>
                <p className="text-xs text-[#6f86a7]">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {errorMessage ? (
          <p className="mt-4 rounded-2xl border border-[#ffd2d5] bg-[#fff7f8] px-4 py-3 text-sm text-[#b23a49]">
            {errorMessage}
          </p>
        ) : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <form
          className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-soft"
          onSubmit={(event) => {
            event.preventDefault();
            void handleCreateUser();
          }}
        >
          <div className="flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-[color:var(--primary)]" />
            <h2 className="text-xl font-semibold text-[#183153]">
              Add teacher account
            </h2>
          </div>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className={inputLabelClass}>Name</span>
              <input
                type="text"
                value={userForm.name}
                onChange={(event) => updateUserField('name', event.target.value)}
                className={fieldClass}
              />
            </label>

            <label className="block">
              <span className={inputLabelClass}>Email</span>
              <input
                type="email"
                value={userForm.email}
                onChange={(event) => updateUserField('email', event.target.value)}
                className={fieldClass}
              />
            </label>

            <label className="block">
              <span className={inputLabelClass}>Role</span>
              <select
                value={userForm.role}
                onChange={(event) => updateUserField('role', event.target.value)}
                className={fieldClass}
              >
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
            </label>

            <label className="block">
              <span className={inputLabelClass}>Reason</span>
              <textarea
                rows={4}
                value={userForm.reason}
                onChange={(event) =>
                  updateUserField('reason', event.target.value)
                }
                className={fieldClass}
              />
            </label>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-full bg-[color:var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              Add account
            </button>
            <button
              type="button"
              onClick={resetUserForm}
              className="rounded-full border border-[color:var(--border)] bg-white px-5 py-2.5 text-sm font-semibold text-[#56708f] transition hover:bg-[color:var(--surface)]"
            >
              Reset
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {isLoading ? (
            <div className="rounded-[28px] border border-[color:var(--border)] bg-white p-8 text-center text-sm text-[#6f86a7]">
              Багшийн мэдээллийг ачаалж байна...
            </div>
          ) : teachers.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-[color:var(--border)] bg-[color:var(--surface)] p-8 text-center text-sm text-[#6f86a7]">
              Бүртгэлтэй багш одоогоор байхгүй байна.
            </div>
          ) : (
            teachers.map((teacher) => (
              <article
                key={teacher.id}
                className="rounded-[28px] border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-soft"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-[#183153]">
                        {teacher.name}
                      </h3>
                      <StatusBadge type="teacher" text="teacher" />
                      <StatusBadge
                        type={teacher.accountStatus}
                        text={teacher.accountStatus}
                      />
                    </div>
                    <p className="mt-1 text-sm text-[#6f86a7]">
                      {teacher.email}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-[#60789a]">
                      {teacher.notes}
                    </p>
                  </div>

                  <div className="text-right text-xs text-[#6f86a7]">
                    <p>Clubs</p>
                    <p className="mt-1 text-lg font-semibold text-[#183153]">
                      {teacher.clubCount}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void updateUserRole(teacher.id, 'student')}
                    disabled={isSaving}
                    className="rounded-full bg-[color:var(--primary)] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                  >
                    Make student
                  </button>
                  <button
                    type="button"
                    onClick={() => void toggleUserRestriction(teacher.id)}
                    disabled={isSaving}
                    className="rounded-full border border-[#e3c98a] bg-white px-4 py-2 text-xs font-semibold text-[#ae7922] transition hover:bg-[#fff8e8] disabled:opacity-50"
                  >
                    {teacher.accountStatus === 'restricted'
                      ? 'Remove restriction'
                      : 'Restrict'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void toggleUserBan(teacher.id)}
                    disabled={isSaving}
                    className="rounded-full border border-[#f4b5ba] bg-white px-4 py-2 text-xs font-semibold text-[#de4a58] transition hover:bg-[#fff6f7] disabled:opacity-50"
                  >
                    {teacher.accountStatus === 'banned' ? 'Unban' : 'Ban'}
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
