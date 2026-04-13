'use client';

import { useState } from 'react';
import { DashboardSectionContent } from './dashboard-content';
import type { DashboardSectionId } from './dashboard-sections';
import { DashboardSidebar } from './dashboard-sidebar';
import { DashboardTopbar } from './dashboard-topbar';

export function WorkplaceDashboard() {
  const [activeSection, setActiveSection] =
    useState<DashboardSectionId>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <main className="dashboard-shell min-h-screen overflow-hidden px-3 py-3 sm:px-4 sm:py-4">
      <div className="pointer-events-none absolute left-0 top-0 h-72 w-72 rounded-full bg-white/35 blur-3xl" />
      <div className="pointer-events-none absolute right-[6%] top-12 h-64 w-64 rounded-full bg-[#99d7c5]/24 blur-3xl floating-orb" />

      <DashboardSidebar
        activeSection={activeSection}
        isOpen={isSidebarOpen}
        onSectionChange={setActiveSection}
        onToggle={() => setIsSidebarOpen((current) => !current)}
      />

      <section
        className={`relative min-w-0 px-1 pb-6 pt-20 transition-all duration-300 sm:px-2 lg:pt-3 ${
          isSidebarOpen ? 'lg:ml-[304px]' : 'lg:ml-[108px]'
        }`}
      >
        <DashboardTopbar section={activeSection} />
        <div key={activeSection} className="mt-5 space-y-5">
          <DashboardSectionContent section={activeSection} />
        </div>
      </section>
    </main>
  );
}
