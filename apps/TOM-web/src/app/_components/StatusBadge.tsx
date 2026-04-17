// components/ClubCard.tsx
export const StatusBadge = ({ type, text }: { type: string, text: string }) => {
  const styles: any = {
    open: "bg-green-100 text-green-800",
    full: "bg-red-100 text-red-800",
    pending: "bg-yellow-100 text-yellow-700",
    approved: "bg-green-100 text-green-800",
  };
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${styles[type] || "bg-slate-100"}`}>
      {text}
    </span>
  );
};

