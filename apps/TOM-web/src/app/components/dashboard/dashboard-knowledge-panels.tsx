const ringMetrics = [
  {
    label: 'Борлуулалт',
    value: 85,
    detail: '223 идэвхтэй',
    color: '#f7a928',
  },
  {
    label: 'Харилцагч',
    value: 40,
    detail: '1,008 боломжит харилцагч',
    color: '#aa58c7',
  },
  {
    label: 'Үйл ажиллагаа',
    value: 65,
    detail: '770 ажил',
    color: '#8da3d8',
  },
];

const topProducts = [
  'Харилцагчийн системийн холболт',
  'Борлуулалтын юүлүүр',
  'Нөөцийн хяналт',
  'Хүний нөөцийн портал',
];
const topGroups = [
  'Хойд бүс',
  'Чиглүүлэх баг',
  'Харилцагчийн үйлчилгээ',
  'Захиргааны үйл ажиллагаа',
];

function RingMetric({
  label,
  value,
  detail,
  color,
}: {
  label: string;
  value: number;
  detail: string;
  color: string;
}) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (value / 100) * circumference;

  return (
    <div className="rounded-[24px] border border-[#e5e8df] bg-white p-4 text-center shadow-[0_16px_34px_rgba(62,89,79,0.08)]">
      <div className="relative mx-auto h-24 w-24">
        <svg
          aria-hidden="true"
          className="h-full w-full -rotate-90"
          viewBox="0 0 100 100"
        >
          <circle
            cx="50"
            cy="50"
            fill="none"
            r={radius}
            stroke="#edf1ec"
            strokeWidth="8"
          />
          <circle
            cx="50"
            cy="50"
            fill="none"
            r={radius}
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            strokeWidth="8"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-lg font-semibold tracking-[-0.04em] text-[#29423e]">
          {value}%
        </div>
      </div>
      <p className="mt-4 text-sm font-semibold text-[#29423e]">{label}</p>
      <p className="mt-1 text-xs text-[#90a198]">{detail}</p>
    </div>
  );
}

function RankedPanel({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <article className="dashboard-entrance dashboard-entrance-delay-4 rounded-[26px] border border-[#e4e7de] bg-white p-5 shadow-[0_18px_38px_rgba(62,89,79,0.08)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#98a59d]">
        Товч жагсаалт
      </p>
      <h3 className="mt-2 text-lg font-semibold tracking-[-0.04em] text-[#28423d]">
        {title}
      </h3>
      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <div
            key={item}
            className="flex items-center justify-between rounded-[18px] bg-[#f7faf6] px-3 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-semibold text-[#6f8278] shadow-[0_6px_12px_rgba(62,89,79,0.08)]">
                {index + 1}
              </span>
              <span className="text-sm font-medium text-[#324a45]">{item}</span>
            </div>
            <span className="h-2.5 w-2.5 rounded-full bg-[#7fc6b5]" />
          </div>
        ))}
      </div>
    </article>
  );
}

export function DashboardKnowledgePanels() {
  return (
    <section className="grid gap-5 xl:grid-cols-[1.1fr_minmax(0,1fr)]">
      <article className="dashboard-entrance dashboard-entrance-delay-3 rounded-[30px] border border-[#e4e7de] bg-[#f8faf7] p-5 shadow-[0_18px_40px_rgba(62,89,79,0.08)] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#97a59c]">
              Гүйцэтгэлийн тойрог
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#28423d]">
              Модулийн төлөв
            </h2>
          </div>
          <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#6f8278] shadow-[0_10px_22px_rgba(62,89,79,0.06)]">
            Яг сая шинэчлэгдсэн
          </span>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {ringMetrics.map((item) => (
            <RingMetric
              key={item.label}
              color={item.color}
              detail={item.detail}
              label={item.label}
              value={item.value}
            />
          ))}
        </div>
      </article>

      <div className="grid gap-5 sm:grid-cols-2">
        <RankedPanel items={topProducts} title="Шилдэг бүтээгдэхүүн" />
        <RankedPanel items={topGroups} title="Идэвхтэй бүлэг" />
      </div>
    </section>
  );
}
