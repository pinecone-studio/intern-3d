type StatusBadgeType =
  | 'open'
  | 'full'
  | 'pending'
  | 'approved'
  | 'active'
  | 'rejected'
  | 'spam'
  | 'review'
  | 'paused';

const badgeStyles: Record<StatusBadgeType, string> = {
  open: 'bg-green-100 text-green-800',
  full: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-800',
  active: 'bg-emerald-100 text-emerald-800',
  rejected: 'bg-rose-100 text-rose-800',
  spam: 'bg-slate-200 text-slate-700',
  review: 'bg-indigo-100 text-indigo-800',
  paused: 'bg-amber-100 text-amber-800',
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
      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${
        badgeStyles[type as StatusBadgeType] ?? 'bg-slate-100 text-slate-700'
      }`}
    >
      {text}
    </span>
  );
};
