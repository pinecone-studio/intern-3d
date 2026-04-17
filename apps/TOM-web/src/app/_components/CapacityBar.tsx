export const CapacityBar = ({ current, total }: { current: number, total: number }) => {
  const percentage = (current / total) * 100;
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-900 font-medium">{current} / {total}</span>
      <div className="w-20 h-1 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${percentage >= 100 ? 'bg-red-500' : 'bg-indigo-600'}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};