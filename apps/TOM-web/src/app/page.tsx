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
    description: 'Approve clubs, manage status, and remove spam requests.',
  },
];

export default function HomePage() {
  return (
    <main className=" min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-[36px] border border-[#d6e4fb] bg-white ">
          <div className="grid gap-6 px-6 py-8 lg:grid-cols-[1.35fr_0.85fr] lg:px-8">
            <div className="space-y-4">
            
              <div className="space-y-3">
                <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-[#142f52] sm:text-5xl">
                 ene dr bol log in hiih heregte, ehnii eeljind inged harchi
                </h1>
               
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
              className={`dashboard-entrance rounded-[28px] border border-[#dce7f8] bg-white p-6 shadow-[0_18px_60px_rgba(19,45,96,0.08)] transition hover:-translate-y-1 hover:shadow-[0_22px_70px_rgba(19,45,96,0.12)] ${
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
