const studentClubs = [
  {
    name: 'English Club',
    teacher: 'Ms. Sarah Kim',
    schedule: 'Mon, Wed, Fri • 15:30',
    grade: 'Grade 6A - 7B',
    seats: '8 / 12 seats used',
    state: 'Open for requests',
  },
  {
    name: 'Prep Club',
    teacher: 'Mr. Bat-Erdene',
    schedule: 'Tue, Thu • 16:00',
    grade: 'Grade 7A - 8B',
    seats: '10 / 10 seats used',
    state: 'Full right now',
  },
  {
    name: 'Reading Circle',
    teacher: 'Ms. Naraa',
    schedule: 'Wed • 14:30',
    grade: 'Grade 6A - 6C',
    seats: '4 / 9 seats used',
    state: 'Pending approval flow',
  },
];

const studentRules = [
  'Students can join only one club.',
  'The request button should disable if the club is full.',
  'After sending a request, status becomes pending.',
];

export default function StudentsPage() {
  return (
    <main className="dashboard-shell min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="dashboard-entrance overflow-hidden rounded-[36px] border border-[#d6e4fb] bg-white/90 shadow-[0_28px_80px_rgba(15,39,87,0.12)] backdrop-blur">
          <div className="grid gap-6 px-6 py-7 lg:grid-cols-[1.4fr_0.85fr] lg:px-8">
            <div className="space-y-4">
              <span className="inline-flex rounded-full bg-[#183a72] px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#eff5ff]">
                Student dashboard
              </span>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-[#142f52] sm:text-5xl">
                  Browse clubs and send one join request
                </h1>
                <p className="max-w-2xl text-sm text-[#5d7696] sm:text-base">
                  This first skeleton focuses on clarity: students should
                  immediately see available clubs, capacity, and whether they can
                  still apply.
                </p>
              </div>
            </div>

            <div className="rounded-[30px] bg-[#173765] p-5 text-[#edf4ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <p className="text-xs uppercase tracking-[0.28em] text-[#b9cff0]">
                First design pass
              </p>
              <h2 className="mt-2 text-2xl font-semibold">1 active request</h2>
              <p className="mt-2 text-sm text-[#d6e5fb]">Student flow</p>
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

        <section className="grid gap-4 lg:grid-cols-[1.35fr_0.85fr]">
          <div className="grid gap-4">
            {studentClubs.map((club, index) => (
              <article
                key={club.name}
                className={`dashboard-entrance rounded-[28px] border border-[#dce7f8] bg-white/92 p-5 shadow-[0_18px_60px_rgba(19,45,96,0.08)] ${
                  index === 1
                    ? 'dashboard-entrance-delay-1'
                    : index === 2
                    ? 'dashboard-entrance-delay-2'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6e86a7]">
                      {club.grade}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-[#183153]">
                      {club.name}
                    </h2>
                  </div>
                  <span className="rounded-full bg-[#edf5ff] px-3 py-1 text-xs font-semibold text-[#386099]">
                    {club.state}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 text-sm text-[#597291]">
                  <div className="flex items-center justify-between gap-3 border-b border-[#e8eef8] pb-3">
                    <span className="text-[#7590b0]">Teacher</span>
                    <span className="text-right font-medium text-[#2b4c77]">
                      {club.teacher}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-b border-[#e8eef8] pb-3">
                    <span className="text-[#7590b0]">Schedule</span>
                    <span className="text-right font-medium text-[#2b4c77]">
                      {club.schedule}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[#7590b0]">Capacity</span>
                    <span className="text-right font-medium text-[#2b4c77]">
                      {club.seats}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="rounded-full bg-[#193a70] px-5 py-3 text-sm font-semibold text-white"
                  >
                    Send request
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-[#eaf1fb] px-5 py-3 text-sm font-semibold text-[#355987]"
                  >
                    View details
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="space-y-4">
            <section className="dashboard-entrance rounded-[28px] border border-[#dce7f8] bg-white/92 p-5 shadow-[0_18px_60px_rgba(19,45,96,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#6e86a7]">
                Request status
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[#183153]">
                Current student state
              </h2>
              <p className="mt-3 text-sm text-[#57708f]">
                Selected club: none yet. Once a request is sent, the student
                waits for teacher or admin approval.
              </p>
              <div className="mt-5 space-y-3">
                {[
                  'View available clubs',
                  'Send join request',
                  'Wait for approval',
                ].map((action) => (
                  <div
                    key={action}
                    className="rounded-3xl border border-[#e4edf9] bg-[#f8fbff] px-4 py-4 text-sm font-medium text-[#27466f]"
                  >
                    {action}
                  </div>
                ))}
              </div>
            </section>

            <section className="dashboard-entrance dashboard-entrance-delay-2 rounded-[28px] border border-[#dce7f8] bg-[#f6faff]/95 p-5 shadow-[0_18px_60px_rgba(19,45,96,0.05)]">
              <h3 className="text-xl font-semibold text-[#183153]">
                Rules to show clearly
              </h3>
              <div className="mt-4 space-y-2">
                {studentRules.map((item) => (
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
