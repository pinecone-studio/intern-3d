import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Plus,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react';

const requests = [
  { name: 'Astronomy Society', by: 'Sara M.', date: 'Apr 18', interest: 12 },
  { name: 'Debate Club', by: 'Omar T.', date: 'Apr 17', interest: 9 },
  { name: 'Photography Hub', by: 'Eli W.', date: 'Apr 15', interest: 6 },
];

const myClubs = [
  { name: 'Robotics Lab', status: 'Active', verified: true, members: 42 },
  { name: 'Chess Masters', status: 'Active', verified: false, members: 19 },
  { name: 'Math Olympiad', status: 'Inactive', verified: true, members: 4 },
];

const stats = [
  {
    label: 'Pending requests',
    value: 8,
    icon: ClipboardList,
    accent: 'bg-gradient-teacher',
  },
  {
    label: 'My clubs',
    value: 5,
    icon: ShieldCheck,
    accent: 'bg-gradient-primary',
  },
  {
    label: 'Inactive clubs',
    value: 2,
    icon: AlertCircle,
    accent: 'bg-gradient-admin',
  },
  {
    label: 'Upcoming events',
    value: 3,
    icon: Calendar,
    accent: 'bg-gradient-student',
  },
];

function PanelHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--border)]/60 bg-[color:var(--background)]/80 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-[color:var(--muted-foreground)] transition-colors hover:text-[color:var(--foreground)]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <div className="h-6 w-px bg-[color:var(--border)]" />
          <div className="flex items-center gap-3">
            <div className="bg-gradient-teacher shadow-soft flex h-9 w-9 items-center justify-center rounded-xl">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-semibold leading-tight text-[color:var(--foreground)]">
                Teacher Panel
              </h1>
              <p className="text-xs leading-tight text-[color:var(--muted-foreground)]">
                Supervise &amp; support
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full bg-[color:var(--muted)] px-3 py-1.5 text-xs text-[color:var(--muted-foreground)] md:flex">
            <span className="h-2 w-2 rounded-full bg-[color:var(--success)]" />
            Online
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--primary-soft)] text-sm font-semibold text-[color:var(--primary)]">
            JD
          </div>
        </div>
      </div>
    </header>
  );
}

export default function TeacherDashboard() {
  return (
    <div className="min-h-screen bg-gradient-hero font-sans text-[color:var(--foreground)]">
      <PanelHeader />

      <main className="container mx-auto space-y-8 px-6 py-8">
        <section className="grid gap-4 md:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className="shadow-soft rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--card-foreground)]"
              >
                <div className="flex items-center gap-4 p-5">
                  <div
                    className={`shadow-soft flex h-12 w-12 items-center justify-center rounded-2xl ${stat.accent}`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{stat.value}</p>
                    <p className="text-xs text-[color:var(--muted-foreground)]">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="shadow-soft lg:col-span-2 rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--card-foreground)]">
            <div className="flex flex-row items-center justify-between p-6">
              <div className="text-base font-semibold leading-none tracking-tight">
                Club creation requests
              </div>
              <div className="rounded-full border border-transparent bg-[color:var(--secondary)] px-2.5 py-0.5 text-xs font-semibold text-[color:var(--secondary-foreground)]">
                {requests.length} pending
              </div>
            </div>
            <div className="space-y-3 p-6 pt-0">
              {requests.map((request) => (
                <div
                  key={request.name}
                  className="flex items-center justify-between rounded-2xl border border-[color:var(--border)] p-4 transition-colors hover:bg-[color:var(--muted)]/50"
                >
                  <div>
                    <p className="font-medium">{request.name}</p>
                    <p className="mt-1 text-xs text-[color:var(--muted-foreground)]">
                      by {request.by} · {request.date} · {request.interest}{' '}
                      interested
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button className="inline-flex h-8 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-[color:var(--input)] bg-[color:var(--background)] px-3 text-xs font-medium shadow-sm transition-colors hover:bg-[color:var(--accent)] hover:text-[color:var(--accent-foreground)]">
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </button>
                    <button className="inline-flex h-8 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[color:var(--primary)] px-3 text-xs font-medium text-[color:var(--primary-foreground)] shadow transition-colors hover:opacity-90">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="shadow-soft rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--card-foreground)]">
            <div className="p-6">
              <div className="text-base font-semibold leading-none tracking-tight">
                Quick actions
              </div>
            </div>
            <div className="space-y-3 p-6 pt-0">
              <button className="inline-flex w-full items-center justify-start gap-2 rounded-full bg-[color:var(--primary)] px-4 py-2 text-sm font-medium text-[color:var(--primary-foreground)] shadow transition-colors hover:opacity-90">
                <Plus className="h-4 w-4" /> Create new club
              </button>
              <button className="inline-flex w-full items-center justify-start gap-2 rounded-full border border-[color:var(--input)] bg-[color:var(--background)] px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-[color:var(--accent)] hover:text-[color:var(--accent-foreground)]">
                <Calendar className="h-4 w-4" /> Post an event
              </button>
              <button className="inline-flex w-full items-center justify-start gap-2 rounded-full border border-[color:var(--input)] bg-[color:var(--background)] px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-[color:var(--accent)] hover:text-[color:var(--accent-foreground)]">
                <ShieldCheck className="h-4 w-4" /> Verify a club
              </button>
            </div>
          </div>
        </section>

        <div className="shadow-soft rounded-3xl border border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--card-foreground)]">
          <div className="p-6">
            <div className="text-base font-semibold leading-none tracking-tight">
              Clubs I supervise
            </div>
          </div>
          <div className="p-6 pt-0">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-[color:var(--muted)]/50">
                    <th className="h-10 px-2 text-left align-middle font-medium text-[color:var(--muted-foreground)]">
                      Club
                    </th>
                    <th className="h-10 px-2 text-left align-middle font-medium text-[color:var(--muted-foreground)]">
                      Members
                    </th>
                    <th className="h-10 px-2 text-left align-middle font-medium text-[color:var(--muted-foreground)]">
                      Status
                    </th>
                    <th className="h-10 px-2 text-left align-middle font-medium text-[color:var(--muted-foreground)]">
                      Verified
                    </th>
                    <th className="h-10 px-2 text-right align-middle font-medium text-[color:var(--muted-foreground)]">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {myClubs.map((club) => (
                    <tr
                      key={club.name}
                      className="border-b transition-colors hover:bg-[color:var(--muted)]/50"
                    >
                      <td className="p-2 align-middle font-medium">
                        {club.name}
                      </td>
                      <td className="p-2 align-middle">{club.members}</td>
                      <td className="p-2 align-middle">
                        <div
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            club.status === 'Active'
                              ? 'bg-[color:var(--success)]/15 text-[color:var(--success)]'
                              : 'bg-[color:var(--warning)]/20 text-[color:var(--warning-foreground)]'
                          }`}
                        >
                          {club.status}
                        </div>
                      </td>
                      <td className="p-2 align-middle">
                        {club.verified ? (
                          <div className="inline-flex items-center rounded-full border-0 bg-[color:var(--primary-soft)] px-2.5 py-0.5 text-xs font-semibold text-[color:var(--primary)]">
                            <ShieldCheck className="mr-1 h-3 w-3" /> Yes
                          </div>
                        ) : (
                          <span className="text-xs text-[color:var(--muted-foreground)]">
                            —
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-right align-middle">
                        <button className="inline-flex h-8 items-center justify-center rounded-full px-3 text-xs font-medium transition-colors hover:bg-[color:var(--accent)] hover:text-[color:var(--accent-foreground)]">
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
