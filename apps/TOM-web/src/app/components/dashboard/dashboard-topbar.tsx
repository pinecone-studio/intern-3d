'use client';

import { useState } from 'react';
import {
  dashboardSectionMeta,
  type DashboardSectionId,
} from './dashboard-sections';
import { DashboardIcon } from './dashboard-ui';

type SearchScope = 'knowledge' | 'employee';

export function DashboardTopbar({
  section,
}: {
  section: DashboardSectionId;
}) {
  const meta = dashboardSectionMeta[section];
  const [searchScope, setSearchScope] = useState<SearchScope>('knowledge');
  const searchPlaceholder =
    searchScope === 'knowledge' ? 'Knowledge base-ээс хайх...' : 'Ажилтан хайх...';
  const searchAriaLabel =
    searchScope === 'knowledge' ? 'Knowledge base-ээс хайх' : 'Ажилтан хайх';

  return (
    <header className="dashboard-entrance dashboard-entrance-delay-2 space-y-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 rounded-[22px] border border-[#e5e7dc] bg-white px-4 py-3 text-sm text-[#5e7067] shadow-[0_12px_30px_rgba(62,89,79,0.08)] lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <DashboardIcon className="h-4 w-4 shrink-0 text-[#9aa89f]" name="search" />
            <input
              aria-label={searchAriaLabel}
              className="w-full bg-transparent text-[#28413d] outline-none placeholder:text-[#adb7b1]"
              placeholder={searchPlaceholder}
              type="search"
            />
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto">
            <button
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                searchScope === 'knowledge'
                  ? 'bg-[#2f8a72] text-white shadow-[0_10px_20px_rgba(47,138,114,0.18)]'
                  : 'bg-[#f1f4ef] text-[#72847b]'
              }`}
              onClick={() => setSearchScope('knowledge')}
              type="button"
            >
              Knowledge base
            </button>
            <button
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                searchScope === 'employee'
                  ? 'bg-[#2f8a72] text-white shadow-[0_10px_20px_rgba(47,138,114,0.18)]'
                  : 'bg-[#f1f4ef] text-[#72847b]'
              }`}
              onClick={() => setSearchScope('employee')}
              type="button"
            >
              Ажилтан
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-full bg-[#2f8a72] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_18px_32px_rgba(47,138,114,0.28)] transition hover:-translate-y-0.5 hover:bg-[#27755f]"
            type="button"
          >
            <DashboardIcon className="h-4 w-4" name="plus" />
            {meta.actionLabel}
          </button>
          <button
            aria-label="Мэдэгдэл"
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#e3e5db] bg-white text-[#2f5c52] shadow-[0_12px_26px_rgba(62,89,79,0.08)] transition hover:-translate-y-0.5"
            type="button"
          >
            <DashboardIcon className="h-4 w-4" name="bell" />
            <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-[#2f8a72]" />
          </button>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#2f8a72] text-sm font-semibold text-white shadow-[0_16px_28px_rgba(47,138,114,0.24)]">
            N
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#8ea196]">
            {meta.eyebrow}
          </p>
          <h1 className="mt-2 text-[clamp(1.75rem,4vw,2.8rem)] font-semibold tracking-[-0.06em] text-[#26423d]">
            {meta.title}
          </h1>
          {meta.description ? (
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#6f8178]">
              {meta.description}
            </p>
          ) : null}
        </div>

        {meta.quickNotes.length ? (
          <div className="flex flex-wrap gap-2">
            {meta.quickNotes.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[#dde5de] bg-[#f7faf6] px-3 py-1.5 text-xs font-medium text-[#60756a]"
              >
                {item}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </header>
  );
}
