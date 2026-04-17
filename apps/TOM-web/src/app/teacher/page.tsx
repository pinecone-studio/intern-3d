const teacherRequests = [
  {
    student: 'Anu Erdene',
    club: 'English Club',
    detail: 'Grade 6A • Wants speaking practice',
    state: 'Pending',
  },
  {
    student: 'Temuulen Gan',
    club: 'English Club',
    detail: 'Grade 6B • Requested by homeroom teacher',
    state: 'Pending',
  },
  {
    student: 'Naraa Otgon',
    club: 'Reading Circle',
    detail: 'Grade 6A • Quiet learner, strong reading habit',
    state: 'Review',
  },
];

const teacherActions = [
  'Review incoming requests',
  'Approve or reject students',
  'Monitor attendance later',
];

export default function TeacherPage() {
  return (
    <main className="dashboard-shell min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="dashboard-entrance overflow-hidden rounded-[36px] border border-[#d6e4fb] bg-white/90 shadow-[0_28px_80px_rgba(15,39,87,0.12)] backdrop-blur">
          <div className="grid gap-6 px-6 py-7 lg:grid-cols-[1.4fr_0.85fr] lg:px-8">
            <div className="space-y-4">
              <span className="inline-flex rounded-full bg-[#183a72] px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#eff5ff]">
                Teacher dashboard
              </span>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-[#142f52] sm:text-5xl">
                  Manage clubs and review student requests
                </h1>
                <p className="max-w-2xl text-sm text-[#5d7696] sm:text-base">
                  The teacher screen is built around decision-making: which club
                  they manage, who requested to join, and how quickly they can
                  approve or reject.
                </p>
              </div>
            </div>

            <div className="rounded-[30px] bg-[#173765] p-5 text-[#edf4ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <p className="text-xs uppercase tracking-[0.28em] text-[#b9cff0]">
                First design pass
              </p>
              <h2 className="mt-2 text-2xl font-semibold">3 requests waiting</h2>
              <p className="mt-2 text-sm text-[#d6e5fb]">Teacher view</p>
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

        <section className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
          <section className="dashboard-entrance rounded-[28px] border border-[#dce7f8] bg-white/92 p-5 shadow-[0_18px_60px_rgba(19,45,96,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#6e86a7]">
              Managed clubs
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[#183153]">
              Teacher responsibilities
            </h2>
            <p className="mt-3 text-sm text-[#57708f]">
              Teachers own the clubs assigned to them, keep an eye on capacity,
              and review which students should be admitted first.
            </p>
            <div className="mt-5 space-y-3">
              {teacherActions.map((action) => (
                <div
                  key={action}
                  className="rounded-3xl border border-[#e4edf9] bg-[#f8fbff] px-4 py-4 text-sm font-medium text-[#27466f]"
                >
                  {action}
                </div>
              ))}
            </div>
          </section>

          <section className="dashboard-entrance dashboard-entrance-delay-1 rounded-[28px] border border-[#dce7f8] bg-white/92 p-5 shadow-[0_18px_60px_rgba(19,45,96,0.08)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#6e86a7]">
                  Request queue
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-[#183153]">
                  Students waiting for review
                </h2>
              </div>
              <span className="rounded-full bg-[#e7f0ff] px-3 py-1 text-xs font-semibold text-[#244c87]">
                English Club
              </span>
            </div>

            <div className="mt-5 space-y-3">
              {teacherRequests.map((request, index) => (
                <article
                  key={request.student}
                  className={`rounded-3xl border border-[#e6eefb] bg-[#f7fbff] p-4 ${
                    index === 1
                      ? 'dashboard-entrance-delay-2'
                      : index === 2
                      ? 'dashboard-entrance-delay-3'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-[#163154]">
                        {request.student}
                      </h3>
                      <p className="mt-1 text-sm text-[#57708f]">
                        {request.detail}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#4f6d97] ring-1 ring-[#d4e1f7]">
                      {request.state}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <p className="text-sm font-medium text-[#29496f]">
                      Club: {request.club}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-full bg-[#193a70] px-4 py-2 text-sm font-semibold text-white"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        className="rounded-full bg-[#eaf1fb] px-4 py-2 text-sm font-semibold text-[#355987]"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
