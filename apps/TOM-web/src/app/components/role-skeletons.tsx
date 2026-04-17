'use client';

type ClubCard = {
  name: string;
  teacher: string;
  schedule: string;
  grade: string;
  seats: string;
  state: string;
};

type RequestCard = {
  student: string;
  club: string;
  detail: string;
  state: string;
};

type SectionCard = {
  title: string;
  value: string;
  description: string;
};

const studentClubs: ClubCard[] = [
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

const teacherRequests: RequestCard[] = [
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

const adminClubs: SectionCard[] = [
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

export function StudentSkeletonPage() {
  return (
    <RolePageShell
      role="Student"
      title="Browse clubs and send one join request"
      description="This first skeleton focuses on clarity: students should immediately see available clubs, capacity, and whether they can still apply."
      summaryLabel="Student flow"
      summaryValue="1 active request"
    >
      <section className="grid gap-4 lg:grid-cols-[1.35fr_0.85fr]">
        <div className="grid gap-4">
          {studentClubs.map((club, index) => (
            <ClubSkeletonCard
              key={club.name}
              club={club}
              delayClass={index === 1 ? 'dashboard-entrance-delay-1' : index === 2 ? 'dashboard-entrance-delay-2' : ''}
            />
          ))}
        </div>

        <div className="space-y-4">
          <ActionPanel
            eyebrow="Request status"
            title="Current student state"
            description="Selected club: none yet. Once a request is sent, the student waits for teacher or admin approval."
            actions={['View available clubs', 'Send join request', 'Wait for approval']}
          />
          <SoftPanel
            title="Rules to show clearly"
            items={[
              'Students can join only one club.',
              'The request button should disable if the club is full.',
              'After sending a request, status becomes pending.',
            ]}
          />
        </div>
      </section>
    </RolePageShell>
  );
}

export function TeacherSkeletonPage() {
  return (
    <RolePageShell
      role="Teacher"
      title="Manage clubs and review student requests"
      description="The teacher screen is built around decision-making: which club they manage, who requested to join, and how quickly they can approve or reject."
      summaryLabel="Teacher view"
      summaryValue="3 requests waiting"
    >
      <section className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
        <ActionPanel
          eyebrow="Managed clubs"
          title="Teacher responsibilities"
          description="Teachers own the clubs assigned to them, keep an eye on capacity, and review which students should be admitted first."
          actions={[
            'Review incoming requests',
            'Approve or reject students',
            'Monitor attendance later',
          ]}
        />

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
                  index === 1 ? 'dashboard-entrance-delay-2' : index === 2 ? 'dashboard-entrance-delay-3' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-[#163154]">
                      {request.student}
                    </h3>
                    <p className="mt-1 text-sm text-[#57708f]">{request.detail}</p>
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
    </RolePageShell>
  );
}

export function AdminSkeletonPage() {
  return (
    <RolePageShell
      role="Admin"
      title="Create clubs and control the whole system"
      description="The admin layout works like the command center: club creation at the top, overview cards in the middle, and approvals or policy controls on the side."
      summaryLabel="Admin control"
      summaryValue="Everything starts here"
    >
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="dashboard-entrance rounded-[28px] border border-[#dce7f8] bg-white/92 p-5 shadow-[0_18px_60px_rgba(19,45,96,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#6e86a7]">
            Club creation form
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[#183153]">
            Admin adds and controls clubs
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              'Club name',
              'Teacher',
              'Date range',
              'Allowed days',
              'Class / grade',
              'Student limit',
            ].map((field) => (
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
            {adminClubs.map((item, index) => (
              <article
                key={item.title}
                className={`dashboard-entrance rounded-[28px] border border-[#dce7f8] bg-white/92 p-5 shadow-[0_18px_60px_rgba(19,45,96,0.08)] ${
                  index === 1 ? 'dashboard-entrance-delay-1' : index === 2 ? 'dashboard-entrance-delay-2' : ''
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6e86a7]">
                  {item.title}
                </p>
                <h3 className="mt-2 text-xl font-semibold text-[#183153]">
                  {item.value}
                </h3>
                <p className="mt-2 text-sm text-[#57708f]">{item.description}</p>
              </article>
            ))}
          </div>

          <SoftPanel
            title="Future admin panel ideas"
            items={[
              'Teacher assignment per club',
              'Approval override history',
              'Attendance dashboard and reports',
            ]}
          />
        </div>
      </section>
    </RolePageShell>
  );
}

function RolePageShell({
  role,
  title,
  description,
  summaryLabel,
  summaryValue,
  children,
}: {
  role: string;
  title: string;
  description: string;
  summaryLabel: string;
  summaryValue: string;
  children: React.ReactNode;
}) {
  return (
    <main className="dashboard-shell min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="dashboard-entrance overflow-hidden rounded-[36px] border border-[#d6e4fb] bg-white/90 shadow-[0_28px_80px_rgba(15,39,87,0.12)] backdrop-blur">
          <div className="grid gap-6 px-6 py-7 lg:grid-cols-[1.4fr_0.85fr] lg:px-8">
            <div className="space-y-4">
              <span className="inline-flex rounded-full bg-[#183a72] px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#eff5ff]">
                {role} dashboard
              </span>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-[#142f52] sm:text-5xl">
                  {title}
                </h1>
                <p className="max-w-2xl text-sm text-[#5d7696] sm:text-base">
                  {description}
                </p>
              </div>
            </div>

            <div className="rounded-[30px] bg-[#173765] p-5 text-[#edf4ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <p className="text-xs uppercase tracking-[0.28em] text-[#b9cff0]">
                First design pass
              </p>
              <h2 className="mt-2 text-2xl font-semibold">{summaryValue}</h2>
              <p className="mt-2 text-sm text-[#d6e5fb]">
                {summaryLabel}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <MiniStat label="Theme" value="White" />
                <MiniStat label="Accent" value="Pastel Blue" />
                <MiniStat label="Primary" value="Navy" />
                <MiniStat label="Stage" value="Skeleton" />
              </div>
            </div>
          </div>
        </section>

        {children}
      </div>
    </main>
  );
}

function ClubSkeletonCard({
  club,
  delayClass,
}: {
  club: ClubCard;
  delayClass?: string;
}) {
  return (
    <article
      className={`dashboard-entrance rounded-[28px] border border-[#dce7f8] bg-white/92 p-5 shadow-[0_18px_60px_rgba(19,45,96,0.08)] ${delayClass ?? ''}`}
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
        <InfoRow label="Teacher" value={club.teacher} />
        <InfoRow label="Schedule" value={club.schedule} />
        <InfoRow label="Capacity" value={club.seats} />
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
  );
}

function ActionPanel({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions: string[];
}) {
  return (
    <section className="dashboard-entrance rounded-[28px] border border-[#dce7f8] bg-white/92 p-5 shadow-[0_18px_60px_rgba(19,45,96,0.08)]">
      <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#6e86a7]">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-[#183153]">{title}</h2>
      <p className="mt-3 text-sm text-[#57708f]">{description}</p>
      <div className="mt-5 space-y-3">
        {actions.map((action, index) => (
          <div
            key={action}
            className={`rounded-3xl border border-[#e4edf9] bg-[#f8fbff] px-4 py-4 text-sm font-medium text-[#27466f] ${
              index === 1 ? 'dashboard-entrance-delay-1' : index === 2 ? 'dashboard-entrance-delay-2' : ''
            }`}
          >
            {action}
          </div>
        ))}
      </div>
    </section>
  );
}

function SoftPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="dashboard-entrance dashboard-entrance-delay-2 rounded-[28px] border border-[#dce7f8] bg-[#f6faff]/95 p-5 shadow-[0_18px_60px_rgba(19,45,96,0.05)]">
      <h3 className="text-xl font-semibold text-[#183153]">{title}</h3>
      <div className="mt-4 space-y-2">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-2xl bg-white px-4 py-3 text-sm text-[#557091] ring-1 ring-[#e1eafb]"
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/8 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-[#b8cff0]">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#e8eef8] pb-3 last:border-b-0 last:pb-0">
      <span className="text-[#7590b0]">{label}</span>
      <span className="text-right font-medium text-[#2b4c77]">{value}</span>
    </div>
  );
}
