import Link from 'next/link';

const roleLinks = [
  {
    href: '/students',
    title: 'Student',
    description: 'Browse available clubs and send one join request.',
  },
  {
    href: '/teacher',
    title: 'Teacher',
    description: 'Manage assigned clubs and review student requests.',
  },
  {
    href: '/admin',
    title: 'Admin',
    description: 'Create clubs and control the overall club system.',
  },
];

export default function HomePage() {
  return (
    <main className="dashboard-shell min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-[36px] border border-[#d6e4fb] bg-white/90 ">
          <div className="grid gap-6 px-6 py-8 lg:grid-cols-[1.35fr_0.85fr] lg:px-8">
            <div className="space-y-4">
              <span className="inline-flex rounded-full bg-[#183a72] px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#eff5ff]">
                Club Manager
              </span>
              <div className="space-y-3">
                <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-[#142f52] sm:text-5xl">
                  Choose a dashboard and start with the right role.
                </h1>
                <p className="max-w-2xl text-sm text-[#5d7696] sm:text-base">
                  This home screen is now just a clean entry point. Pick the
                  student, teacher, or admin view to continue into the skeleton
                  designs.
                </p>
              </div>
            </div>

            <div className="rounded-[30px] bg-[#173765] p-5 text-[#edf4ff] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <p className="text-xs uppercase tracking-[0.28em] text-[#b9cff0]">
                Quick navigation
              </p>
              <h2 className="mt-2 text-2xl font-semibold">3 role entries</h2>
              <p className="mt-2 text-sm text-[#d6e5fb]">
                Simple landing page for testing each route while we build the
                real product flow.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {roleLinks.map((role, index) => (
            <Link
              key={role.href}
              href={role.href}
              className={`dashboard-entrance rounded-[28px] border border-[#dce7f8] bg-white/92 p-6 shadow-[0_18px_60px_rgba(19,45,96,0.08)] transition hover:-translate-y-1 hover:shadow-[0_22px_70px_rgba(19,45,96,0.12)] ${
                index === 1
                  ? 'dashboard-entrance-delay-1'
                  : index === 2
                  ? 'dashboard-entrance-delay-2'
                  : ''
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6e86a7]">
                Open role
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-[#183153]">
                {role.title}
              </h2>
              <p className="mt-3 text-sm text-[#57708f]">{role.description}</p>
              <div className="mt-6 inline-flex rounded-full bg-[#193a70] px-4 py-2 text-sm font-semibold text-white">
                Go to {role.title}
              </div>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
