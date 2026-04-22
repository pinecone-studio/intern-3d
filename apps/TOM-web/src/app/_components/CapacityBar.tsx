export const CapacityBar = ({
  current,
  total,
}: {
  current: number;
  total: number;
}) => {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));

  return (
    <div className="flex w-full items-center gap-3">
      <span className="min-w-12 text-sm font-semibold text-[#17304f]">
        {current} / {total}
      </span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#e8eff8]">
        <div
          className={`h-full rounded-full bg-[linear-gradient(90deg,_#5aa6ef_0%,_#79bef6_100%)] ${
            percentage >= 100 ? 'shadow-[0_0_18px_rgba(90,166,239,0.35)]' : ''
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
