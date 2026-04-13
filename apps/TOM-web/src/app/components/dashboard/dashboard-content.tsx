import type { ReactNode } from 'react';
import type { DashboardSectionId } from './dashboard-sections';
import { DashboardIcon } from './dashboard-ui';
import type { DashboardIconName } from './dashboard-ui';

const dailyFocusTasks = [
  {
    title: 'Групп системийн sidebar урсгал шалгах',
    detail: 'Digital Product баг',
    due: 'Өнөөдөр 11:00',
  },
  {
    title: 'Шинэ ажилтны welcome материал батлах',
    detail: 'People Ops',
    due: 'Өнөөдөр 14:30',
  },
  {
    title: 'Сар бүрийн шалгалтын reminder илгээх',
    detail: 'Learning admin',
    due: 'Өнөөдөр 17:00',
  },
];

const nextMeeting = {
  time: '15:00',
  title: 'Product weekly sync',
  detail: '4B өрөө | 6 оролцогч',
};

const activePoll = {
  title: 'Та багийн уулзалтын цагаа сонгоогүй байна',
  question: 'Ирэх 7 хоногийн уулзалтыг хэдэн цагт хийх вэ?',
  action: 'Саналаа өгөх',
};

const latestUpdates = [
  'Knowledge base-д “Шинэ ажилтны гарын авлага 2026” нэмэгдсэн',
  'Digital Product бүлэгт sprint planning-ийн зар нийтлэгдсэн',
];

const activeMembers = [
  { initials: 'Н', name: 'Номин', status: 'Онлайн' },
  { initials: 'Т', name: 'Тэмүүжин', status: 'Онлайн' },
  { initials: 'А', name: 'Ариунаа', status: 'Чөлөөтэй' },
  { initials: 'Б', name: 'Билгүүн', status: 'Амралттай' },
];

const groupPulse = [
  'People Ops бүлэг onboarding checklist-ээ шинэчилсэн',
  'Field Sales баг CRM follow-up task-уудаа хааж эхэлсэн',
];

const growthStats = [
  { label: 'Сүүлийн шалгалтын оноо', value: '88%' },
  { label: 'Энэ 7 хоногт хаасан ажил', value: '12' },
];

const growthBars = [
  { label: 'Даалгавар', value: 72 },
  { label: 'Шалгалт', value: 88 },
  { label: 'Оролцоо', value: 64 },
  { label: 'Ахиц', value: 91 },
];

const taskStats = [
  {
    label: 'Нийт ажил',
    value: '48',
    detail: 'идэвхтэй ба төлөвлөсөн ажлууд',
    icon: 'checklist' as DashboardIconName,
  },
  {
    label: 'Явж буй',
    value: '18',
    detail: 'эзэнтэй, гүйцэтгэлд орсон',
    icon: 'activity' as DashboardIconName,
  },
  {
    label: 'Өнөөдөр дуусах',
    value: '7',
    detail: 'яаралтай анхаарах шаардлагатай',
    icon: 'clock' as DashboardIconName,
  },
  {
    label: 'Хаагдсан',
    value: '26',
    detail: 'энэ 7 хоногт амжилттай хаагдсан',
    icon: 'briefcase' as DashboardIconName,
  },
];

const taskColumns = [
  {
    title: 'Шинээр орсон',
    items: [
      'Sidebar navigation-ийг section-оор салгах',
      'Мобайл view spacing шалгах',
      'Шинэ ажилтны onboarding flow зураглах',
    ],
  },
  {
    title: 'Явж байна',
    items: [
      'Group system-ийн календарийн холболт',
      'Knowledge base хайлтын ангилал',
      'Poll үр дүнгийн widget шинэчлэх',
    ],
  },
  {
    title: 'Дуусах дөхсөн',
    items: [
      'Шалгалтын сарын тайлан гаргах',
      'Event participant file upload',
      'Task reminder push notification',
    ],
  },
];

const taskDeadlines = [
  { title: 'Design system sync', owner: 'Номин', due: 'Өнөөдөр 18:00' },
  { title: 'Дотоод журам шинэчлэх', owner: 'Тэмүүжин', due: 'Маргааш 10:30' },
  { title: 'Event budget review', owner: 'Ариунaa', due: 'Пүрэв 15:00' },
];

const workload = [
  { label: 'UI баг', value: 78 },
  { label: 'Backend баг', value: 62 },
  { label: 'HR баг', value: 46 },
  { label: 'Admin баг', value: 58 },
];

const groups = [
  {
    title: 'Digital Product',
    detail: 'UI, backend, QA хамтарсан бүтээгдэхүүний үндсэн баг.',
    members: '12 гишүүн',
    tasks: '18 ажил',
    meeting: 'Лхагва 11:00',
  },
  {
    title: 'People Operations',
    detail: 'Onboarding, дотоод соёл, ажилчдын туршлага хариуцсан бүлэг.',
    members: '8 гишүүн',
    tasks: '9 ажил',
    meeting: 'Баасан 14:00',
  },
  {
    title: 'Field Sales',
    detail: 'Бүсийн борлуулалт, CRM follow-up, customer visit төлөвлөлт.',
    members: '15 гишүүн',
    tasks: '21 ажил',
    meeting: 'Мягмар 09:30',
  },
];

const groupCalendar = [
  { time: '09:30', title: 'Digital Product standup', place: '4B өрөө' },
  { time: '11:00', title: 'People Ops onboarding review', place: 'HR studio' },
  { time: '16:00', title: 'Field Sales weekly wrap-up', place: 'Sales hall' },
];

const groupHighlights = [
  { label: 'Идэвхтэй бүлэг', value: '9' },
  { label: 'Нээлттэй ажил', value: '54' },
  { label: 'Календарийн уулзалт', value: '12' },
];

const events = [
  {
    title: 'Хаврын байгууллагын аялал',
    date: '4 сарын 18',
    time: '08:00 - 18:00',
    place: 'Тэрэлж resort',
    participants: '46 оролцогч',
    files: '5 файл',
  },
  {
    title: 'Шинэ ажилтны welcome day',
    date: '4 сарын 22',
    time: '10:00 - 15:00',
    place: '2 давхрын lounge',
    participants: '18 оролцогч',
    files: '3 файл',
  },
  {
    title: 'Quarterly townhall',
    date: '4 сарын 27',
    time: '16:00 - 17:30',
    place: 'Main hall',
    participants: '120 оролцогч',
    files: '7 файл',
  },
];

const eventResources = [
  'Хөтөлбөрийн PDF',
  'Оролцогчдын жагсаалт',
  'Зардлын тооцоо',
  'Зөвшөөрлийн маягт',
];

const knowledgeCategories = [
  {
    title: 'Дүрэм, журам',
    detail: 'Байгууллагын дотоод бодлого, ёс зүй, ажлын журам.',
    count: '34 файл',
    icon: 'shield' as DashboardIconName,
  },
  {
    title: 'Гарын авлага',
    detail: 'Систем ашиглах заавар, SOP, workflow тайлбарууд.',
    count: '52 файл',
    icon: 'book' as DashboardIconName,
  },
  {
    title: 'Onboarding багц',
    detail: 'Шинэ ажилтанд зориулсан танилцах материал, checklist.',
    count: '18 файл',
    icon: 'users' as DashboardIconName,
  },
];

const latestDocs = [
  'Ажилтны гарын авлага 2026',
  'Сар бүрийн шалгалтын журам',
  'Task management SOP',
  'Эвент зохион байгуулах checklist',
];

const onboardingSteps = [
  { label: 'Компанийн бүтэцтэй танилцах', value: 100 },
  { label: 'Дотоод дүрэм унших', value: 82 },
  { label: 'Системийн access авах', value: 68 },
  { label: 'Эхний шалгалт өгөх', value: 46 },
];

const examStats = [
  { label: 'Энэ сарын шалгалт', value: '3', detail: 'хуваарьт үнэлгээнүүд' },
  { label: 'Дундаж оноо', value: '86%', detail: 'бүх ажилчдын дундаж' },
  { label: 'Оролцоо', value: '92%', detail: 'шалгалтад хамрагдсан хувь' },
];

const examRows = [
  { title: 'Аюулгүй ажиллагаа', date: '4 сарын 15', participants: '74/80', score: '88%' },
  { title: 'Дотоод журам', date: '4 сарын 21', participants: '61/80', score: '84%' },
  { title: 'Систем ашиглалт', date: '4 сарын 29', participants: 'Төлөвлөсөн', score: '—' },
];

const examProgress = [
  { label: 'Аюулгүй ажиллагаа', value: 88 },
  { label: 'Дотоод журам', value: 84 },
  { label: 'Onboarding шалгалт', value: 73 },
];

const polls = [
  {
    question: 'Багийн уулзалтыг хэдэн цагт хийх вэ?',
    options: [
      { label: '10:00', value: 42 },
      { label: '14:00', value: 33 },
      { label: '16:00', value: 25 },
    ],
  },
  {
    question: 'Хаврын арга хэмжээг хаана зохион байгуулах вэ?',
    options: [
      { label: 'Тэрэлж', value: 51 },
      { label: 'Хотын төв', value: 29 },
      { label: 'Спорт төв', value: 20 },
    ],
  },
];

const pollHighlights = [
  '5 идэвхтэй санал асуулга',
  '87 шинэ хариу',
  'Бодит цагийн шинэчлэлттэй',
];

const recentPolls = [
  'Сургалтын өдөр сонгох',
  'Team lunch menu',
  'Quarterly meetup формат',
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function SurfaceCard({
  eyebrow,
  title,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        'dashboard-entrance rounded-[30px] border border-[#e5e8de] bg-white p-5 shadow-[0_18px_42px_rgba(62,89,79,0.08)] sm:p-6',
        className
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#96a49b]">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[#28423d]">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </article>
  );
}

function StatTile({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: DashboardIconName;
}) {
  return (
    <div className="rounded-[24px] border border-[#e5e9e1] bg-white p-4 shadow-[0_14px_34px_rgba(62,89,79,0.08)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef5f0] text-[#2f8a72]">
          <DashboardIcon className="h-5 w-5" name={icon} />
        </div>
        <span className="rounded-full bg-[#f4f8f4] px-3 py-1 text-xs font-semibold text-[#72847b]">
          {label}
        </span>
      </div>
      <p className="mt-5 text-3xl font-semibold tracking-[-0.06em] text-[#28423d]">
        {value}
      </p>
      <p className="mt-2 text-sm text-[#8b9b92]">{detail}</p>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#ecf1ed]">
      <div
        className="h-full rounded-full bg-[#5ba591]"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function HomeMemberBadge({
  initials,
  name,
  status,
}: {
  initials: string;
  name: string;
  status: string;
}) {
  const toneClassName =
    status === 'Амралттай'
      ? 'bg-[#d7dfe6]'
      : status === 'Чөлөөтэй'
        ? 'bg-[#f2c879]'
        : 'bg-[#63b79f]';

  return (
    <div className="flex items-center gap-3 rounded-[18px] border border-[#e8ece3] bg-white px-3 py-3">
      <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#2f8a72] text-sm font-semibold text-white">
        {initials}
        <span
          className={`absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white ${toneClassName}`}
        />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#29423e]">{name}</p>
        <p className="text-xs text-[#85968d]">{status}</p>
      </div>
    </div>
  );
}

function MiniBarChart() {
  return (
    <div className="rounded-[22px] border border-[#e8ece3] bg-[#fbfcfa] p-4">
      <div className="flex h-36 items-end gap-3">
        {growthBars.map((item) => (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-3">
            <div className="flex h-full w-full items-end justify-center">
              <div
                className="w-full rounded-t-[14px] bg-[linear-gradient(180deg,#8dcdbd_0%,#5ba591_100%)]"
                style={{ height: `${item.value}%` }}
              />
            </div>
            <div className="text-center">
              <p className="text-[11px] font-semibold text-[#7a8d84]">{item.label}</p>
              <p className="mt-1 text-xs text-[#9aa8a0]">{item.value}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function HomeSection() {
  return (
    <section className="grid gap-5 xl:grid-cols-2">
      <SurfaceCard eyebrow="Миний өдрийн төлөвлөгөө" title="Өнөөдөр юу хийх вэ?">
        <div className="space-y-3">
          {dailyFocusTasks.map((item) => (
            <div
              key={item.title}
              className="rounded-[22px] border border-[#e8ece3] bg-[#fbfcfa] px-4 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-[#29423e]">{item.title}</p>
                  <p className="mt-1 text-sm text-[#84958c]">{item.detail}</p>
                </div>
                <span className="rounded-full bg-[#eef5f0] px-3 py-1 text-xs font-semibold text-[#6f8278]">
                  {item.due}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-[24px] bg-[linear-gradient(135deg,#2f8a72_0%,#4c9f8a_100%)] p-4 text-white shadow-[0_18px_36px_rgba(47,138,114,0.22)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
            Өнөөдрийн хамгийн ойрын уулзалт
          </p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-2xl font-semibold tracking-[-0.05em]">
                {nextMeeting.time}
              </p>
              <p className="mt-1 text-sm font-medium">{nextMeeting.title}</p>
              <p className="mt-1 text-sm text-white/72">{nextMeeting.detail}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
              <DashboardIcon className="h-5 w-5" name="calendar" />
            </div>
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard
        eyebrow="Шуурхай мэдэгдэл ба санал асуулга"
        title="Таны оролцоо шаардлагатай"
      >
        <div className="rounded-[24px] border border-[#dfe9e1] bg-[#f6faf7] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#29423e]">
                {activePoll.title}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#7a8c83]">
                {activePoll.question}
              </p>
            </div>
            <span className="rounded-full bg-[#fff3db] px-3 py-1 text-xs font-semibold text-[#9a7126]">
              Идэвхтэй
            </span>
          </div>
          <button
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#2f8a72] px-4 py-2 text-sm font-semibold text-white"
            type="button"
          >
            <DashboardIcon className="h-4 w-4" name="poll" />
            {activePoll.action}
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {latestUpdates.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-[18px] border border-[#e8ece3] bg-white px-4 py-3"
            >
              <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#eef5f0] text-[#2f8a72]">
                <DashboardIcon className="h-4 w-4" name="spark" />
              </div>
              <p className="text-sm leading-6 text-[#526861]">{item}</p>
            </div>
          ))}
        </div>
      </SurfaceCard>

      <SurfaceCard eyebrow="Багийн статус" title="Байгууллагад юу болж байна?">
        <div className="grid gap-3 sm:grid-cols-2">
          {activeMembers.map((member) => (
            <HomeMemberBadge
              key={member.name}
              initials={member.initials}
              name={member.name}
              status={member.status}
            />
          ))}
        </div>

        <div className="mt-5 rounded-[22px] border border-[#e8ece3] bg-[#fbfcfa] p-4">
          <p className="text-sm font-semibold text-[#29423e]">Группийн идэвх</p>
          <div className="mt-3 space-y-3">
            {groupPulse.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#63b79f]" />
                <p className="text-sm leading-6 text-[#566b64]">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </SurfaceCard>

      <SurfaceCard eyebrow="Хувийн ахиц ба шалгалт" title="Өсөлт ба шалгалт">
        <div className="rounded-[24px] border border-[#e8ece3] bg-[#fbfcfa] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-[#29423e]">
                Энэ сарын мэдлэг сорих шалгалт нээгдлээ
              </p>
              <p className="mt-2 text-sm leading-6 text-[#7d8f86]">
                4 сарын 28 хүртэл өгөх боломжтой. Дүн нь таны сарын ахиц дээр хадгалагдана.
              </p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef5f0] text-[#2f8a72]">
              <DashboardIcon className="h-5 w-5" name="graduation" />
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid gap-3">
            {growthStats.map((item) => (
              <div
                key={item.label}
                className="rounded-[20px] border border-[#e8ece3] bg-white px-4 py-4"
              >
                <p className="text-sm text-[#7f9187]">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-[#28423d]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
          <MiniBarChart />
        </div>
      </SurfaceCard>
    </section>
  );
}

function TasksSection() {
  return (
    <div className="grid gap-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {taskStats.map((item) => (
          <StatTile
            key={item.label}
            detail={item.detail}
            icon={item.icon}
            label={item.label}
            value={item.value}
          />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <SurfaceCard eyebrow="Явцын самбар" title="Даалгаврын төлөвүүд">
          <div className="grid gap-4 lg:grid-cols-3">
            {taskColumns.map((column) => (
              <div
                key={column.title}
                className="rounded-[24px] border border-[#e8ece3] bg-[#f8faf7] p-4"
              >
                <p className="text-sm font-semibold text-[#29423e]">{column.title}</p>
                <div className="mt-4 space-y-3">
                  {column.items.map((item) => (
                    <div
                      key={item}
                      className="rounded-[18px] bg-white px-3 py-3 text-sm text-[#486058] shadow-[0_10px_24px_rgba(62,89,79,0.06)]"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <div className="grid gap-5">
          <SurfaceCard eyebrow="Хугацаа" title="Ойртсон хугацаанууд">
            <div className="space-y-3">
              {taskDeadlines.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[20px] border border-[#e8ece3] bg-[#fbfcfa] px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#29423e]">{item.title}</p>
                      <p className="mt-1 text-sm text-[#8b9b92]">{item.owner}</p>
                    </div>
                    <span className="rounded-full bg-[#eef5f0] px-3 py-1 text-xs font-semibold text-[#6f8278]">
                      {item.due}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard eyebrow="Ачаалал" title="Багийн хуваарилалт">
            <div className="space-y-4">
              {workload.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-[#324842]">{item.label}</span>
                    <span className="text-[#7f9187]">{item.value}%</span>
                  </div>
                  <ProgressBar value={item.value} />
                </div>
              ))}
            </div>
          </SurfaceCard>
        </div>
      </section>
    </div>
  );
}

function GroupsSection() {
  return (
    <div className="grid gap-5">
      <section className="grid gap-4 md:grid-cols-3">
        {groupHighlights.map((item) => (
          <div
            key={item.label}
            className="rounded-[24px] border border-[#e5e9e1] bg-white p-4 shadow-[0_14px_34px_rgba(62,89,79,0.08)]"
          >
            <p className="text-sm text-[#7f9187]">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-[#28423d]">
              {item.value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <SurfaceCard eyebrow="Бүлгүүд" title="Идэвхтэй төслийн орон зай">
          <div className="grid gap-4">
            {groups.map((group) => (
              <div
                key={group.title}
                className="rounded-[24px] border border-[#e6ebe2] bg-[#fbfcfa] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-[#29423e]">
                      {group.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-[#7f9087]">
                      {group.detail}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#eef5f0] px-3 py-1 text-xs font-semibold text-[#6f8278]">
                    {group.members}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-[#dde5de] bg-white px-3 py-1 text-xs text-[#6f8278]">
                    {group.tasks}
                  </span>
                  <span className="rounded-full border border-[#dde5de] bg-white px-3 py-1 text-xs text-[#6f8278]">
                    Уулзалт: {group.meeting}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard eyebrow="Календарь" title="Өнөөдрийн уулзалтууд">
          <div className="space-y-3">
            {groupCalendar.map((item) => (
              <div
                key={item.title}
                className="rounded-[20px] border border-[#e8ece3] bg-white px-4 py-4"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-[16px] bg-[#eef5f0] px-3 py-2 text-sm font-semibold text-[#2f8a72]">
                    {item.time}
                  </div>
                  <div>
                    <p className="font-semibold text-[#29423e]">{item.title}</p>
                    <p className="mt-1 text-sm text-[#83948b]">{item.place}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </section>
    </div>
  );
}

function EventsSection() {
  return (
    <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
      <SurfaceCard eyebrow="Нэг удаагийн бүлэг" title="Төлөвлөгдсөн эвентүүд">
        <div className="grid gap-4">
          {events.map((event) => (
            <div
              key={event.title}
              className="rounded-[24px] border border-[#e7ebe3] bg-[#fbfcfa] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-[#29423e]">
                    {event.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#7f9087]">
                    {event.date} | {event.time}
                  </p>
                  <p className="mt-1 text-sm text-[#7f9087]">{event.place}</p>
                </div>
                <span className="rounded-full bg-[#eef5f0] px-3 py-1 text-xs font-semibold text-[#6f8278]">
                  {event.files}
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-[#dde5de] bg-white px-3 py-1 text-xs text-[#6f8278]">
                  {event.participants}
                </span>
                <span className="rounded-full border border-[#dde5de] bg-white px-3 py-1 text-xs text-[#6f8278]">
                  Бүх мэдээлэл нэг дор
                </span>
              </div>
            </div>
          ))}
        </div>
      </SurfaceCard>

      <div className="grid gap-5">
        <SurfaceCard eyebrow="Файлууд" title="Эвентийн материалууд">
          <div className="space-y-3">
            {eventResources.map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-[18px] border border-[#e8ece3] bg-white px-4 py-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef5f0] text-[#2f8a72]">
                  <DashboardIcon className="h-4 w-4" name="file" />
                </div>
                <span className="text-sm font-medium text-[#324842]">{item}</span>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard eyebrow="Тэмдэглэл" title="Эвент бүрт бүртгэх зүйлс">
          <div className="space-y-3 text-sm text-[#6f8178]">
            <p>Огноо, цаг, байршил, оролцогчид, хариуцах эзэн, файл хавсаргалт.</p>
            <p>Түр бүлэг үүсээд дуусмагц архивлагдах байдлаар зохион байгуулж болно.</p>
          </div>
        </SurfaceCard>
      </div>
    </section>
  );
}

function KnowledgeSection() {
  return (
    <section className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
      <SurfaceCard eyebrow="Мэдээллийн сан" title="Баримт бичгийн үндсэн ангиллууд">
        <div className="grid gap-4 md:grid-cols-3">
          {knowledgeCategories.map((item) => (
            <div
              key={item.title}
              className="rounded-[24px] border border-[#e7ebe3] bg-[#fbfcfa] p-4"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#eef5f0] text-[#2f8a72]">
                <DashboardIcon className="h-5 w-5" name={item.icon} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-[#29423e]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-[#7f9087]">{item.detail}</p>
              <p className="mt-4 text-sm font-semibold text-[#2f8a72]">{item.count}</p>
            </div>
          ))}
        </div>
      </SurfaceCard>

      <div className="grid gap-5">
        <SurfaceCard eyebrow="Шинэчлэлт" title="Сүүлд нэмэгдсэн материал">
          <div className="space-y-3">
            {latestDocs.map((item) => (
              <div
                key={item}
                className="rounded-[18px] border border-[#e8ece3] bg-white px-4 py-3 text-sm font-medium text-[#324842]"
              >
                {item}
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard eyebrow="Onboarding" title="Шинэ ажилтны дасан зохицох зам">
          <div className="space-y-4">
            {onboardingSteps.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-[#324842]">{item.label}</span>
                  <span className="text-[#7f9187]">{item.value}%</span>
                </div>
                <ProgressBar value={item.value} />
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>
    </section>
  );
}

function ExamsSection() {
  return (
    <div className="grid gap-5">
      <section className="grid gap-4 md:grid-cols-3">
        {examStats.map((item) => (
          <div
            key={item.label}
            className="rounded-[24px] border border-[#e5e9e1] bg-white p-4 shadow-[0_14px_34px_rgba(62,89,79,0.08)]"
          >
            <p className="text-sm text-[#7f9187]">{item.label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.06em] text-[#28423d]">
              {item.value}
            </p>
            <p className="mt-2 text-sm text-[#8b9b92]">{item.detail}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <SurfaceCard eyebrow="Хуваарь" title="Шалгалтын жагсаалт">
          <div className="space-y-3">
            {examRows.map((item) => (
              <div
                key={item.title}
                className="rounded-[20px] border border-[#e8ece3] bg-[#fbfcfa] px-4 py-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#29423e]">{item.title}</p>
                    <p className="mt-1 text-sm text-[#83948b]">{item.date}</p>
                  </div>
                  <div className="text-right text-sm text-[#6f8178]">
                    <p>{item.participants}</p>
                    <p className="mt-1 font-semibold text-[#2f8a72]">{item.score}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard eyebrow="Дүн" title="Сэдэв тус бүрийн ахиц">
          <div className="space-y-4">
            {examProgress.map((item) => (
              <div key={item.label}>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-[#324842]">{item.label}</span>
                  <span className="text-[#7f9187]">{item.value}%</span>
                </div>
                <ProgressBar value={item.value} />
              </div>
            ))}
          </div>
        </SurfaceCard>
      </section>
    </div>
  );
}

function PollsSection() {
  return (
    <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="grid gap-5">
        {polls.map((poll) => (
          <SurfaceCard key={poll.question} eyebrow="Санал асуулга" title={poll.question}>
            <div className="space-y-4">
              {poll.options.map((option) => (
                <div key={option.label}>
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-[#324842]">{option.label}</span>
                    <span className="text-[#7f9187]">{option.value}%</span>
                  </div>
                  <ProgressBar value={option.value} />
                </div>
              ))}
            </div>
          </SurfaceCard>
        ))}
      </div>

      <div className="grid gap-5">
        <SurfaceCard eyebrow="Төлөв" title="Хариуны тойм">
          <div className="space-y-3">
            {pollHighlights.map((item) => (
              <div
                key={item}
                className="rounded-[18px] border border-[#e8ece3] bg-white px-4 py-3 text-sm font-medium text-[#324842]"
              >
                {item}
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard eyebrow="Өмнөх санал" title="Сүүлд хаагдсан асуулгууд">
          <div className="space-y-3">
            {recentPolls.map((item) => (
              <div
                key={item}
                className="rounded-[18px] border border-[#e8ece3] bg-[#fbfcfa] px-4 py-3 text-sm text-[#486058]"
              >
                {item}
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>
    </section>
  );
}

export function DashboardSectionContent({
  section,
}: {
  section: DashboardSectionId;
}) {
  switch (section) {
    case 'tasks':
      return <TasksSection />;
    case 'groups':
      return <GroupsSection />;
    case 'events':
      return <EventsSection />;
    case 'knowledge':
      return <KnowledgeSection />;
    case 'exams':
      return <ExamsSection />;
    case 'polls':
      return <PollsSection />;
    case 'home':
    default:
      return <HomeSection />;
  }
}
