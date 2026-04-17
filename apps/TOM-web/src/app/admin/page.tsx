'use client';

import { useState } from 'react';

const teacherOptions = [
  'Ms. Sarah Kim',
  'Mr. Bat-Erdene',
  'Ms. Naraa',
  'Mr. Temuulen',
];

const dayOptions = [
  'Mon, Wed, Fri',
  'Tue, Thu',
  'Wed, Sat',
  'Mon, Tue, Thu',
];

const gradeOptions = [
  'Grade 6A - 7B',
  'Grade 6A - 6C',
  'Grade 7A - 8B',
  'Grade 9A - 10B',
];

const adminCards = [
  {
    title: 'Approval flow',
    description: 'Admins can override teacher decisions when needed.',
  },
  {
    title: 'Club setup',
    description: 'Teacher, dates, schedule, grade range, and student cap.',
  },
  {
    title: 'Capacity control',
    description: 'Requests auto-close when the student limit is reached.',
  },
];

const initialForm = {
  clubName: '',
  teacher: teacherOptions[0],
  startDate: '2025-09-01',
  endDate: '2025-12-20',
  allowedDays: dayOptions[0],
  gradeRange: gradeOptions[0],
  studentLimit: '12',
};

export default function AdminDashboard() {
  const [form, setForm] = useState(initialForm);
  const [savedState, setSavedState] = useState<'idle' | 'draft' | 'created'>(
    'idle'
  );

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setSavedState('idle');
  };

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavedState('created');
  };

  const handleSaveDraft = () => {
    setSavedState('draft');
  };

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6">
      <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-600">
          Admin dashboard
        </span>
        <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
          Create clubs and control the whole system
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-500 sm:text-base">
          Set up clubs, assign teachers, configure schedules, and manage
          capacity limits.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
              Club creation form
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">
              Add a new club
            </h2>
          </div>

          <form className="space-y-5" onSubmit={handleCreate}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Club name
                </span>
                <input
                  type="text"
                  value={form.clubName}
                  onChange={(event) =>
                    updateField('clubName', event.target.value)
                  }
                  placeholder="e.g. English Club"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Teacher
                </span>
                <select
                  value={form.teacher}
                  onChange={(event) => updateField('teacher', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white"
                >
                  {teacherOptions.map((teacher) => (
                    <option key={teacher} value={teacher}>
                      {teacher}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Start date
                </span>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(event) =>
                    updateField('startDate', event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  End date
                </span>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(event) => updateField('endDate', event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Allowed days
                </span>
                <select
                  value={form.allowedDays}
                  onChange={(event) =>
                    updateField('allowedDays', event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white"
                >
                  {dayOptions.map((days) => (
                    <option key={days} value={days}>
                      {days}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Class / grade
                </span>
                <select
                  value={form.gradeRange}
                  onChange={(event) =>
                    updateField('gradeRange', event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white"
                >
                  {gradeOptions.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block md:max-w-[180px]">
                <span className="mb-2 block text-sm font-semibold text-slate-700">
                  Student limit
                </span>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={form.studentLimit}
                  onChange={(event) =>
                    updateField('studentLimit', event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white"
                />
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="submit"
                className="rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Create club
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                className="rounded-full border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Save as draft
              </button>
              <span className="text-sm text-slate-500">
                {savedState === 'created'
                  ? `Club ready: ${form.clubName || 'Untitled club'}`
                  : savedState === 'draft'
                  ? 'Draft saved locally'
                  : 'Fill the form and choose the setup you want'}
              </span>
            </div>
          </form>
        </section>

        <aside className="space-y-4">
          {adminCards.map((card) => (
            <section
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                System control
              </p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">
                {card.title}
              </h3>
              <p className="mt-2 text-sm text-slate-500">{card.description}</p>
            </section>
          ))}
        </aside>
      </div>
    </main>
  );
}
