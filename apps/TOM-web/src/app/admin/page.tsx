const adminCards = [
  {
    title: 'Club setup',
    value: 'Create clubs',
    description:
      'Add name, teacher, start and end dates, weekly days, class target, and student limit.',
  },
  {
    title: 'Oversight',
    value: 'Approve flow',
    description:
      'Decide whether admins approve directly or let teachers manage requests under supervision.',
  },
  {
    title: 'Capacity',
    value: 'Limit control',
    description:
      'Stop new requests automatically when the club limit has been reached.',
  },
];

const clubFields = [
  'Club name',
  'Teacher',
  'Date range',
  'Allowed days',
  'Class / grade',
  'Student limit',
];

const futureIdeas = [
  'Teacher assignment per club',
  'Approval override history',
  'Attendance dashboard and reports',
];

export default function AdminPage() {
  return (
    <main className="dashboard-shell min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="dashboard-entrance overflow-hidden rounded-[36px] border border-[#d6e4fb] bg-white/90 shadow-[0_28px_80px_rgba(15,39,87,0.12)] backdrop-blur">
          <div className="grid gap-6 px-6 py-7 lg:grid-cols-[1.4fr_0.85fr] lg:px-8">
            <div className="space-y-4">
              <span className="inline-flex rounded-full bg-[#183a72] px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#eff5ff]">
                Admin dashboard
              </span>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-[#142f52] sm:text-5xl">
                  Create clubs and control the whole system
                </h1>
                <p className="max-w-2xl text-sm text-[#5d7696] sm:text-base">
                  The admin layout works like the command center: club creation
                  at the top, overview cards in the middle, and approvals or
                  policy controls on the side.
                </p>
              </div>
            </div>

            <div className="rounded-[30px] bg-[#173765] p-5 text-[#edf4ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <p className="text-xs uppercase tracking-[0.28em] text-[#b9cff0]">
                First design pass
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Everything starts here
              </h2>
              <p className="mt-2 text-sm text-[#d6e5fb]">Admin control</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-3xl border border-white/10 bg-white/8 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#b8cff0]">
                    Theme
                  </p>
                  <p className="mt-2 text-lg font-semibold">White</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/8 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#b8cff0]">
                    Accent
                  </p>
                  <p className="mt-2 text-lg font-semibold">Pastel Blue</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/8 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#b8cff0]">
                    Primary
                  </p>
                  <p className="mt-2 text-lg font-semibold">Navy</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/8 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#b8cff0]">
                    Stage
                  </p>
                  <p className="mt-2 text-lg font-semibold">Skeleton</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="dashboard-entrance rounded-[28px] border border-[#dce7f8] bg-white/92 p-5 shadow-[0_18px_60px_rgba(19,45,96,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#6e86a7]">
              Club creation form
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[#183153]">
              Admin adds and controls clubs
            </h2>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {clubFields.map((field) => (
                <label key={field} className="grid gap-2 text-sm text-[#4e6788]">
                  <span className="font-medium text-[#28456d]">{field}</span>
                  <div className="rounded-2xl border border-[#d8e4f7] bg-[#f8fbff] px-4 py-3 text-[#9ab0cc]">
                    {field} goes here
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-full bg-[#193a70] px-5 py-3 text-sm font-semibold text-white"
              >
                Create club
              </button>
              <button
                type="button"
                className="rounded-full bg-[#eaf1fb] px-5 py-3 text-sm font-semibold text-[#355987]"
              >
                Save as draft
              </button>
            </div>
          </section>

          <div className="space-y-4">
            <div className="grid gap-4">
              {adminCards.map((item, index) => (
                <article
                  key={item.title}
                  className={`dashboard-entrance rounded-[28px] border border-[#dce7f8] bg-white/92 p-5 shadow-[0_18px_60px_rgba(19,45,96,0.08)] ${
                    index === 1
                      ? 'dashboard-entrance-delay-1'
                      : index === 2
                      ? 'dashboard-entrance-delay-2'
                      : ''
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6e86a7]">
                    {item.title}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-[#183153]">
                    {item.value}
                  </h3>
                  <p className="mt-2 text-sm text-[#57708f]">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>

            <section className="dashboard-entrance dashboard-entrance-delay-2 rounded-[28px] border border-[#dce7f8] bg-[#f6faff]/95 p-5 shadow-[0_18px_60px_rgba(19,45,96,0.05)]">
              <h3 className="text-xl font-semibold text-[#183153]">
                Future admin panel ideas
              </h3>
              <div className="mt-4 space-y-2">
                {futureIdeas.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl bg-white px-4 py-3 text-sm text-[#557091] ring-1 ring-[#e1eafb]"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
