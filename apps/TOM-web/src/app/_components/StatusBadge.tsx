type StatusBadgeType =
  | 'open'
  | 'full'
  | 'pending'
  | 'approved'
  | 'active'
  | 'student'
  | 'teacher'
  | 'rejected'
  | 'spam'
  | 'review'
  | 'paused'
  | 'restricted'
  | 'banned';

const badgeStyles: Record<StatusBadgeType, string> = {
  open: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
  full: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
  pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
  approved: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
  active: 'bg-sky-50 text-sky-700 ring-1 ring-sky-100',
  student: 'bg-sky-50 text-sky-700 ring-1 ring-sky-100',
  teacher: 'bg-violet-50 text-violet-700 ring-1 ring-violet-100',
  rejected: 'bg-rose-50 text-rose-700 ring-1 ring-rose-100',
  spam: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
  review: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100',
  paused: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
  restricted: 'bg-orange-50 text-orange-700 ring-1 ring-orange-100',
  banned: 'bg-rose-100 text-rose-800 ring-1 ring-rose-200',
};

export const StatusBadge = ({
  type,
  text,
}: {
  type: string;
  text: string;
}) => {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-tight ${
        badgeStyles[type as StatusBadgeType] ?? 'bg-slate-100 text-slate-700'
      }`}
    >
      {text}
    </span>
  );
};
