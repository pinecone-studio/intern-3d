import type { ReactNode } from 'react';

export type DashboardTone =
  | 'sky'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'violet';

export type DashboardIconName =
  | 'activity'
  | 'arrowRight'
  | 'bell'
  | 'book'
  | 'briefcase'
  | 'calendar'
  | 'checklist'
  | 'clock'
  | 'file'
  | 'graduation'
  | 'grid'
  | 'home'
  | 'lock'
  | 'logout'
  | 'message'
  | 'pin'
  | 'poll'
  | 'plus'
  | 'search'
  | 'settings'
  | 'shield'
  | 'spark'
  | 'trend'
  | 'users';

const toneClassNames: Record<DashboardTone, string> = {
  sky: 'border-sky-300/25 bg-sky-300/12 text-sky-100',
  emerald: 'border-emerald-300/25 bg-emerald-300/12 text-emerald-100',
  amber: 'border-amber-300/25 bg-amber-300/12 text-amber-100',
  rose: 'border-rose-300/25 bg-rose-300/12 text-rose-100',
  violet: 'border-violet-300/25 bg-violet-300/12 text-violet-100',
};

const progressToneClassNames: Record<DashboardTone, string> = {
  sky: 'bg-sky-300',
  emerald: 'bg-emerald-300',
  amber: 'bg-amber-300',
  rose: 'bg-rose-300',
  violet: 'bg-violet-300',
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function iconMarkup(name: DashboardIconName) {
  switch (name) {
    case 'activity':
      return <path d="M4 13h3l2.2-6 4 10 2.4-7H20" />;
    case 'arrowRight':
      return (
        <>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </>
      );
    case 'bell':
      return (
        <>
          <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
          <path d="M10 20a2 2 0 0 0 4 0" />
        </>
      );
    case 'book':
      return (
        <>
          <path d="M5 4h10a4 4 0 0 1 4 4v12H8a3 3 0 0 1-3-3V4z" />
          <path d="M8 4v13a3 3 0 0 0 3 3" />
        </>
      );
    case 'briefcase':
      return (
        <>
          <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
          <path d="M4 7h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z" />
          <path d="M9 12h6" />
        </>
      );
    case 'calendar':
      return (
        <>
          <path d="M7 3v4" />
          <path d="M17 3v4" />
          <path d="M4 8h16" />
          <path d="M5 5h14a1 1 0 0 1 1 1v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a1 1 0 0 1 1-1z" />
        </>
      );
    case 'checklist':
      return (
        <>
          <path d="m5 7 1.5 1.5L10 5" />
          <path d="M13 7h6" />
          <path d="m5 14 1.5 1.5L10 12" />
          <path d="M13 14h6" />
        </>
      );
    case 'clock':
      return (
        <>
          <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />
          <path d="M12 7v5l3 2" />
        </>
      );
    case 'file':
      return (
        <>
          <path d="M6 3h8l4 4v14H6V3z" />
          <path d="M14 3v5h5" />
          <path d="M9 13h6" />
          <path d="M9 17h4" />
        </>
      );
    case 'graduation':
      return (
        <>
          <path d="m3 8 9-4 9 4-9 4-9-4z" />
          <path d="M7 10v5c3 2 7 2 10 0v-5" />
          <path d="M21 8v6" />
        </>
      );
    case 'grid':
      return (
        <>
          <path d="M4 4h6v6H4z" />
          <path d="M14 4h6v6h-6z" />
          <path d="M4 14h6v6H4z" />
          <path d="M14 14h6v6h-6z" />
        </>
      );
    case 'home':
      return (
        <>
          <path d="m4 11 8-7 8 7" />
          <path d="M6 10.8V20h12v-9.2" />
          <path d="M10 20v-5h4v5" />
        </>
      );
    case 'lock':
      return (
        <>
          <rect height="10" rx="2" width="14" x="5" y="11" />
          <path d="M8 11V8a4 4 0 1 1 8 0v3" />
        </>
      );
    case 'logout':
      return (
        <>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </>
      );
    case 'message':
      return (
        <>
          <path d="M5 6h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 3v-3H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z" />
          <path d="M7.5 10.5h9" />
          <path d="M7.5 14h6" />
        </>
      );
    case 'pin':
      return (
        <>
          <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z" />
          <path d="M12 10.5h.01" />
        </>
      );
    case 'poll':
      return (
        <>
          <path d="M5 19V9" />
          <path d="M12 19V5" />
          <path d="M19 19v-7" />
          <path d="M3 19h18" />
        </>
      );
    case 'plus':
      return (
        <>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </>
      );
    case 'search':
      return (
        <>
          <path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z" />
          <path d="m20 20-3.5-3.5" />
        </>
      );
    case 'settings':
      return (
        <>
          <path d="M12 3v3" />
          <path d="M12 18v3" />
          <path d="M3 12h3" />
          <path d="M18 12h3" />
          <path d="m5.6 5.6 2.1 2.1" />
          <path d="m16.3 16.3 2.1 2.1" />
          <path d="m18.4 5.6-2.1 2.1" />
          <path d="m7.7 16.3-2.1 2.1" />
          <circle cx="12" cy="12" r="3.5" />
        </>
      );
    case 'shield':
      return <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
    case 'spark':
      return (
        <>
          <path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
          <path d="M5 3v3" />
          <path d="M3.5 4.5h3" />
          <path d="M19 16v3" />
          <path d="M17.5 17.5h3" />
        </>
      );
    case 'trend':
      return (
        <>
          <path d="M4 17 9 12l4 4 7-9" />
          <path d="M14 7h6v6" />
        </>
      );
    case 'users':
      return (
        <>
          <path d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0z" />
          <path d="M5 21a7 7 0 0 1 14 0" />
          <path d="M18 7a3 3 0 0 1 3 3" />
          <path d="M21 21a5.4 5.4 0 0 0-3-4.8" />
        </>
      );
    default:
      return null;
  }
}

export function DashboardIcon({
  name,
  className,
}: {
  name: DashboardIconName;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={cn('h-5 w-5', className)}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {iconMarkup(name)}
    </svg>
  );
}

export function IconBadge({
  icon,
  tone = 'sky',
  className,
}: {
  icon: DashboardIconName;
  tone?: DashboardTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex h-12 w-12 items-center justify-center rounded-2xl border shadow-[0_18px_50px_rgba(0,0,0,0.22)]',
        toneClassNames[tone],
        className
      )}
    >
      <DashboardIcon name={icon} />
    </span>
  );
}

export function StatusPill({
  label,
  tone = 'sky',
  className,
}: {
  label: string;
  tone?: DashboardTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]',
        toneClassNames[tone],
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

export function ProgressRail({
  value,
  tone = 'sky',
}: {
  value: number;
  tone?: DashboardTone;
}) {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/10">
      <div
        className={cn(
          'h-full rounded-full shadow-[0_0_24px_currentColor]',
          progressToneClassNames[tone]
        )}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}

export function SectionCard({
  eyebrow,
  title,
  description,
  action,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'dashboard-entrance rounded-[30px] border border-white/10 bg-[rgba(8,25,45,0.72)] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-6',
        className
      )}
    >
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-200/70">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-white sm:text-2xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm text-slate-300">{description}</p>
          ) : null}
        </div>
        {action ? (
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.08] px-4 py-2 text-sm font-semibold text-white transition hover:border-sky-200/50 hover:bg-sky-200/[0.12]"
            type="button"
          >
            {action}
            <DashboardIcon className="h-4 w-4" name="arrowRight" />
          </button>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function MetricCard({
  label,
  value,
  change,
  detail,
  icon,
  tone = 'sky',
  className,
}: {
  label: string;
  value: string;
  change: string;
  detail: string;
  icon: DashboardIconName;
  tone?: DashboardTone;
  className?: string;
}) {
  return (
    <article
      className={cn(
        'dashboard-entrance rounded-[28px] border border-white/10 bg-white/[0.07] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.1]',
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <IconBadge icon={icon} tone={tone} />
        <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-slate-200">
          {change}
        </span>
      </div>
      <div className="mt-6">
        <p className="text-sm text-slate-400">{label}</p>
        <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">
          {value}
        </p>
        <p className="mt-2 text-sm text-slate-300">{detail}</p>
      </div>
    </article>
  );
}
