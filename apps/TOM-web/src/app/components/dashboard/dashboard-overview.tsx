const analyticsBars = [
  { label: 'Аравдугаар сар', values: [38, 58, 44, 76, 51] },
  { label: 'Арваннэгдүгээр сар', values: [42, 84, 48, 68, 57] },
  { label: 'Арванхоёрдугаар сар', values: [33, 61, 39, 72, 46] },
];

const visitorStats = [
  { label: 'Хэрэглэгчид', value: '12.9K', note: 'идэвхтэй сесс' },
  { label: 'Хамрах хүрээ', value: '212.9K', note: 'кампанит ажлын харагдалт' },
];

const visitorTrends = [
  {
    label: 'Тогтоон барилт',
    value: '65%',
    points: [28, 41, 38, 49, 46, 63, 58],
    color: '#97c867',
  },
  {
    label: 'Дундаж хугацаа',
    value: '1м 45с',
    points: [18, 26, 22, 34, 31, 37, 44],
    color: '#74abc6',
  },
];

const actionStats = [
  { label: 'Идэвхтэй захиалга', value: '230' },
  { label: 'Шинэ баг', value: '2' },
  { label: 'Хаагдсан ажил', value: '1500' },
];

const weekLabels = ['Да', 'Мя', 'Лх', 'Пү', 'Ба', 'Бя', 'Ня'];
const teamFlow = [24, 52, 39, 68, 43, 59, 48];

function toPoints(points: number[], width: number, height: number) {
  return points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - (point / 100) * height;
      return `${x},${y}`;
    })
    .join(' ');
}

function toCoordinates(points: number[], width: number, height: number) {
  return points.map((point, index) => ({
    x: (index / (points.length - 1)) * width,
    y: height - (point / 100) * height,
  }));
}

function VisitorsTrend({
  label,
  value,
  points,
  color,
}: {
  label: string;
  value: string;
  points: number[];
  color: string;
}) {
  const width = 180;
  const height = 54;

  return (
    <div className="flex items-center gap-4 rounded-[20px] border border-[#e7ebdf] bg-[#fcfdfb] px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#97a69b]">
          {label}
        </p>
        <p className="mt-2 text-lg font-semibold tracking-[-0.04em] text-[#29423e]">
          {value}
        </p>
      </div>
      <div className="w-[190px] rounded-[18px] bg-white px-3 py-2 shadow-[0_10px_24px_rgba(62,89,79,0.06)]">
        <svg
          aria-hidden="true"
          className="h-[54px] w-full"
          fill="none"
          viewBox={`0 0 ${width} ${height}`}
        >
          <polyline
            points={toPoints(points, width, height)}
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
        </svg>
      </div>
    </div>
  );
}

export function DashboardOverview() {
  const flowWidth = 300;
  const flowHeight = 120;
  const flowCoordinates = toCoordinates(teamFlow, flowWidth, flowHeight);

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="grid gap-5">
        <article className="dashboard-entrance dashboard-entrance-delay-3 rounded-[30px] border border-[#e5e8de] bg-white p-5 shadow-[0_18px_42px_rgba(62,89,79,0.1)] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#94a29a]">
                Самбарын тойм
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#28423d]">
                Аналитик
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[#eef4ef] px-3 py-1.5 text-xs font-semibold text-[#6e8177]">
                Сар бүр
              </span>
              <span className="rounded-full border border-[#dde5de] bg-white px-3 py-1.5 text-xs font-semibold text-[#6e8177]">
                Орлого
              </span>
            </div>
          </div>

          <div className="mt-6 rounded-[28px] border border-[#eef1e8] bg-[#fcfbf8] p-4 sm:p-5">
            <div className="relative h-[230px]">
              <div className="absolute inset-0 grid grid-rows-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="border-t border-[#edf1e8]" />
                ))}
              </div>
              <div className="absolute inset-x-0 top-[28%] border-t border-dashed border-[#efc89b]" />

              <div className="relative flex h-full items-end gap-4">
                {analyticsBars.map((group) => (
                  <div
                    key={group.label}
                    className="flex flex-1 flex-col items-center justify-end gap-4"
                  >
                    <div className="flex h-full w-full items-end justify-center gap-2">
                      {group.values.map((value, index) => (
                        <span
                          key={`${group.label}-${value}-${index}`}
                          className={`w-full max-w-[24px] rounded-t-[10px] ${
                            index === 1 || index === 3
                              ? 'bg-[#80c6b5]'
                              : 'bg-[#eceae5]'
                          }`}
                          style={{ height: `${value}%` }}
                        />
                      ))}
                    </div>
                    <p className="text-xs font-medium text-[#8d9e95]">{group.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </article>

        <article className="dashboard-entrance dashboard-entrance-delay-4 rounded-[30px] border border-[#e5e8de] bg-white p-5 shadow-[0_18px_42px_rgba(62,89,79,0.1)] sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#94a29a]">
                Агшин
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#28423d]">
                Зочид
              </h3>
            </div>
            <span className="rounded-full bg-[#eef4ef] px-3 py-1.5 text-xs font-semibold text-[#6e8177]">
              Шууд
            </span>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {visitorStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[22px] border border-[#e8ece3] bg-[#fbfcfa] p-4"
                >
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#9aaa9e]">
                    {item.label}
                  </p>
                  <p className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-[#28423d]">
                    {item.value}
                  </p>
                  <p className="mt-2 text-sm text-[#8a9a90]">{item.note}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-4">
              {visitorTrends.map((item) => (
                <VisitorsTrend
                  key={item.label}
                  color={item.color}
                  label={item.label}
                  points={item.points}
                  value={item.value}
                />
              ))}
            </div>
          </div>
        </article>
      </div>

      <article className="dashboard-entrance dashboard-entrance-delay-4 rounded-[30px] border border-[#e3e7de] bg-[#f8faf7] p-4 shadow-[0_18px_42px_rgba(62,89,79,0.1)] sm:p-5">
        <div className="rounded-[24px] bg-[#eef5f0] p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#73867c]">
              Багийн хэсэг
            </span>
            <button
              className="rounded-full bg-[#2f8a72] px-3 py-1.5 text-xs font-semibold text-white shadow-[0_12px_24px_rgba(47,138,114,0.22)]"
              type="button"
            >
              Хэсэг засах
            </button>
          </div>

          <div className="mt-4 rounded-[24px] bg-white p-4 shadow-[0_16px_34px_rgba(62,89,79,0.08)]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2f8a72] text-sm font-semibold text-white">
                NS
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#29423e]">
                  Тэргүүлэгч баг
                </p>
                <p className="mt-1 text-xs text-[#8b9b92]">
                  зөөлөн өнгө, авсаархан үзүүлэлтийн картууд
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {actionStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[18px] bg-[#f7faf6] px-3 py-3 text-center"
                >
                  <p className="text-xl font-semibold tracking-[-0.05em] text-[#28423d]">
                    {item.value}
                  </p>
                  <p className="mt-1 text-[11px] leading-4 text-[#90a198]">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-[24px] border border-[#e6e9e1] bg-white p-4 shadow-[0_16px_34px_rgba(62,89,79,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#94a29a]">
                Гүйцэтгэл
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-[#28423d]">
                Багийн урсгал
              </h3>
            </div>
            <span className="rounded-full bg-[#eef4ef] px-3 py-1.5 text-xs font-semibold text-[#6e8177]">
              Сүүлийн 7 хоног
            </span>
          </div>

          <div className="mt-4 h-[170px]">
            <svg
              aria-hidden="true"
              className="h-full w-full"
              fill="none"
              viewBox={`0 0 ${flowWidth} ${flowHeight}`}
            >
              <defs>
                <linearGradient id="dashboard-flow-fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#80c6b5" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#80c6b5" stopOpacity="0" />
                </linearGradient>
              </defs>

              <path
                d={`M 0 ${flowHeight} L ${toPoints(
                  teamFlow,
                  flowWidth,
                  flowHeight
                )} L ${flowWidth} ${flowHeight} Z`}
                fill="url(#dashboard-flow-fill)"
              />
              <polyline
                points={toPoints(teamFlow, flowWidth, flowHeight)}
                stroke="#5ca997"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="4"
              />
              {flowCoordinates.map((point, index) => (
                <circle
                  key={`${point.x}-${point.y}-${index}`}
                  cx={point.x}
                  cy={point.y}
                  fill="#ffffff"
                  r="5"
                  stroke="#5ca997"
                  strokeWidth="3"
                />
              ))}
            </svg>
          </div>

          <div className="mt-2 flex justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a0aea6]">
            {weekLabels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}
