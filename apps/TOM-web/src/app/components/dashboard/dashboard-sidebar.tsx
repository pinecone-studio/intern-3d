import {
  dashboardSectionMeta,
  dashboardSections,
  type DashboardSectionId,
} from './dashboard-sections';
import { DashboardIcon } from './dashboard-ui';

export function DashboardSidebar({
  activeSection,
  isOpen,
  onSectionChange,
  onToggle,
}: {
  activeSection: DashboardSectionId;
  isOpen: boolean;
  onSectionChange: (section: DashboardSectionId) => void;
  onToggle: () => void;
}) {
  const activeMeta = dashboardSectionMeta[activeSection];

  return (
    <aside
      className={`dashboard-entrance dashboard-entrance-delay-1 fixed left-3 top-3 bottom-3 z-40 overflow-hidden rounded-[30px] bg-[linear-gradient(180deg,#2f8a72_0%,#347c67_100%)] text-white shadow-[0_28px_70px_rgba(44,93,77,0.26)] transition-all duration-300 sm:left-4 sm:top-4 sm:bottom-4 ${
        isOpen ? 'w-[280px] p-5' : 'w-[84px] p-3'
      }`}
    >
      <div className="pointer-events-none absolute -right-16 top-14 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 bottom-20 h-32 w-32 rounded-full bg-[#72c9ad]/20 blur-3xl" />

      <div className="relative flex h-full flex-col">
        {isOpen ? (
          <div className="flex items-center gap-3 px-1">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]">
              <DashboardIcon className="h-5 w-5" name="spark" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/60">
                Ажлын орчин
              </p>
              <p className="mt-1 truncate text-sm font-semibold tracking-[0.02em]">
                Лого хэсэг
              </p>
            </div>
            <button
              aria-label="Sidebar хаах"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/14 bg-white/10 text-white transition hover:bg-white/16"
              onClick={onToggle}
              type="button"
            >
              <DashboardIcon
                className="h-4 w-4 rotate-180 transition-transform"
                name="arrowRight"
              />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              aria-label="Sidebar нээх"
              className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/14 bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition hover:bg-white/16"
              onClick={onToggle}
              type="button"
            >
              <DashboardIcon className="h-4 w-4" name="arrowRight" />
            </button>
          </div>
        )}

        <nav
          aria-label="Үндсэн цэс"
          className={`grid gap-2 lg:grid-cols-1 ${isOpen ? 'mt-8' : 'mt-6'}`}
        >
          {dashboardSections.map((item) => (
            <button
              key={item.id}
              className={`group flex items-center rounded-[18px] py-3 text-sm font-medium transition ${
                isOpen ? 'gap-3 px-4' : 'justify-center px-0'
              } ${
                activeSection === item.id
                  ? 'bg-white text-[#2f5c52] shadow-[0_12px_24px_rgba(15,45,34,0.16)]'
                  : 'text-white/82 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => onSectionChange(item.id)}
              title={item.label}
              type="button"
            >
              <DashboardIcon
                className={`h-[18px] w-[18px] ${
                  activeSection === item.id ? 'text-[#2f8a72]' : 'text-white/80'
                }`}
                name={item.icon}
              />
              {isOpen ? <span>{item.label}</span> : null}
              {isOpen && activeSection === item.id ? (
                <span className="ml-auto h-2.5 w-2.5 rounded-full bg-[#2f8a72]" />
              ) : null}
            </button>
          ))}
        </nav>

        {isOpen ? (
          <div className="mt-6 rounded-[24px] border border-white/12 bg-white/10 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/60">
              Шууд төлөв
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-2xl font-semibold tracking-[-0.05em]">
                  {activeMeta.statusValue}
                </p>
                <p className="mt-1 text-xs text-white/68">{activeMeta.statusText}</p>
              </div>
              <span className="rounded-full bg-white/14 px-3 py-1 text-xs font-semibold text-white">
                {activeMeta.statusChange}
              </span>
            </div>
          </div>
        ) : null}

        <button
          className={`mt-auto flex rounded-[18px] border border-white/16 bg-white py-3 text-sm font-semibold text-[#2f5c52] shadow-[0_16px_36px_rgba(24,57,47,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(24,57,47,0.22)] ${
            isOpen ? 'items-center gap-3 px-4' : 'justify-center px-0'
          }`}
          type="button"
        >
          <DashboardIcon className="h-[18px] w-[18px] text-[#2f8a72]" name="logout" />
          {isOpen ? <span>Гарах</span> : null}
        </button>
      </div>
    </aside>
  );
}
