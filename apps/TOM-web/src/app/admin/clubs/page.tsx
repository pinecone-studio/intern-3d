'use client';

import Link from 'next/link';
import { Plus, X } from 'lucide-react';

import { CapacityBar, StatusBadge } from '@/app/_components';
import { useTomOptions } from '@/app/_hooks/useTomOptions';

import { thresholdGoal, formatThresholdLabel } from '../admin-data';
import { useClubsPage } from './useClubsPage';

const fieldClass =
  'w-full rounded-[18px] border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3 text-sm text-[color:var(--text)] outline-none transition placeholder:text-[#8aa0be] focus:border-[color:var(--primary)] focus:bg-white focus:ring-4 focus:ring-[color:var(--primary-soft)]';

const inputLabelClass = 'mb-2 block text-sm font-semibold text-[#5f7697]';

export default function ClubsPage() {
  const { options } = useTomOptions();
  const {
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
  } = useClubsPage(options);

  return (
    <div className="relative min-h-screen">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#183153]">Клубүүд</h1>
          <p className="mt-1 text-sm text-[#6a819f]">
            Бүх идэвхтэй болон түр зогсоосон клубүүд
          </p>
        </div>
        <button
          type="button"
          onClick={openDialog}
          className="flex items-center gap-2 rounded-2xl bg-[#49a0e3] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(26,53,96,0.25)] transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Шинэ клуб
        </button>
      </div>

      {/* Banner */}
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

      {/* Clubs grid */}
      {isLoading ? (
        <div className="mt-10 flex items-center justify-center">
          <p className="text-sm text-[#6a819f]">Клубүүдийг ачаалж байна...</p>
        </div>
      ) : clubs.length === 0 ? (
        <div className="mt-10 rounded-[28px] border border-[#e2eaf5] bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-[#6a819f]">
            Одоогоор идэвхтэй клуб байхгүй байна.
          </p>
        </div>
      ) : (
        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {clubs.map((club) =>
            (() => {
              const clubStatusLabel =
                club.clubStatus === 'active' ? 'Идэвхтэй' : 'Түр зогссон';

              return (
                <article
                  key={club.id}
                  className="rounded-[28px] border border-[#e2eaf5] bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-[#183153]">
                        <Link
                          href={`/admin/clubs/${club.id}`}
                          className="transition hover:underline"
                        >
                          {club.clubName}
                        </Link>
                      </h3>
                      <p className="mt-1 text-sm text-[#6f86a7]">
                        {club.teacher}
                      </p>
                    </div>
                    <StatusBadge
                      type={club.clubStatus}
                      text={clubStatusLabel}
                    />
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-[#60789a]">
                    {club.note && <p>{club.note}</p>}
                    <p>
                      {club.allowedDays} · {club.gradeRange}
                    </p>
                    <p>
                      {club.startDate} – {club.endDate}
                    </p>
                    <p className="font-semibold text-[#183153]">
                      Сурагчид: {club.memberCount} / {club.studentLimit}
                    </p>
                    <CapacityBar
                      current={club.interestCount}
                      total={club.studentLimit}
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => void toggleClubStatus(club.id)}
                      disabled={isSaving}
                      className="rounded-full bg-[#49a0e3] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                    >
                      {club.clubStatus === 'active'
                        ? 'Түр зогсоох'
                        : 'Идэвхжүүлэх'}
                    </button>
                    <StatusBadge
                      type={
                        club.interestCount >= thresholdGoal
                          ? 'approved'
                          : 'pending'
                      }
                      text={formatThresholdLabel(club.interestCount)}
                    />
                  </div>
                </article>
              );
            })()
          )}
        </section>
      )}

      {/* New Club dialog */}
      {isDialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDialog();
          }}
        >
          <div className="w-full max-w-lg rounded-[28px] border border-[color:var(--border)] bg-[color:var(--card)] p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7f93b1]">
                  Хүсэлт үүсгэх
                </p>
                <h2 className="mt-1 text-[1.05rem] font-semibold text-[#183153]">
                  Шинэ клубийн хүсэлтийн маягт
                </h2>
              </div>
              <button
                type="button"
                onClick={closeDialog}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#6a819f] transition hover:bg-[#eef4ff] hover:text-[#1a3560]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void handleCreate();
              }}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className={inputLabelClass}>Клубын нэр</span>
                  <input
                    type="text"
                    value={form.clubName}
                    onChange={(e) => updateField('clubName', e.target.value)}
                    placeholder="Жишээ: Англи хэлний клуб"
                    className={fieldClass}
                  />
                </label>

                <label className="block">
                  <span className={inputLabelClass}>Багш</span>
                  <select
                    value={form.teacherId}
                    onChange={(e) => updateField('teacherId', e.target.value)}
                    className={fieldClass}
                  >
                    {options.teacherOptions.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className={inputLabelClass}>Эхлэх огноо</span>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => updateField('startDate', e.target.value)}
                    className={fieldClass}
                  />
                </label>

                <label className="block">
                  <span className={inputLabelClass}>Дуусах огноо</span>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => updateField('endDate', e.target.value)}
                    className={fieldClass}
                  />
                </label>

                <label className="block">
                  <span className={inputLabelClass}>Өдрүүд</span>
                  <select
                    value={form.allowedDays}
                    onChange={(e) => updateField('allowedDays', e.target.value)}
                    className={fieldClass}
                  >
                    {options.allowedDays.map((days) => (
                      <option key={days} value={days}>
                        {days}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className={inputLabelClass}>Ангийн хүрээ</span>
                  <select
                    value={form.gradeRange}
                    onChange={(e) => updateField('gradeRange', e.target.value)}
                    className={fieldClass}
                  >
                    {options.gradeRanges.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className={inputLabelClass}>Сурагчийн дээд тоо</span>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={form.studentLimit}
                    onChange={(e) =>
                      updateField('studentLimit', e.target.value)
                    }
                    className={fieldClass}
                  />
                </label>

                <label className="block">
                  <span className={inputLabelClass}>Одоогийн сонирхол</span>
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={form.interestCount}
                    onChange={(e) =>
                      updateField('interestCount', e.target.value)
                    }
                    className={fieldClass}
                  />
                </label>
              </div>

              <label className="block">
                <span className={inputLabelClass}>Админы тэмдэглэл</span>
                <textarea
                  rows={3}
                  value={form.note}
                  onChange={(e) => updateField('note', e.target.value)}
                  placeholder="Энэ клуб яагаад чухал болох, юуг шалгах, зөвшөөрөх эсэхтэй холбоотой тэмдэглэлээ энд бичнэ үү."
                  className={fieldClass}
                />
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-full bg-[color:var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(79,114,213,0.22)] transition hover:opacity-90 disabled:opacity-50"
                >
                  {isSaving ? 'Хадгалж байна...' : 'Хүсэлт үүсгэх'}
                </button>
                <button
                  type="button"
                  onClick={closeDialog}
                  className="rounded-full border border-[color:var(--border)] bg-white px-5 py-2.5 text-sm font-semibold text-[#56708f] transition hover:bg-[color:var(--surface)]"
                >
                  Цуцлах
                </button>
                <span className="text-sm text-[#6982a2]">
                  {form.clubName
                    ? `Дараалалд бэлэн: ${form.clubName}`
                    : 'Шинэ клубийн хүсэлтээр эхлээрэй'}
                </span>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
