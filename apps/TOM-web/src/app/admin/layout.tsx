import { Suspense } from 'react';

import SideBar from './_components/sideBar';

export default function StudentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <aside className="fixed left-0 top-0 z-[60] h-screen w-56">
        <Suspense fallback={null}>
          <SideBar />
        </Suspense>
      </aside>

      <main className="ml-56 min-h-screen min-w-0 p-10">
        <Suspense fallback={null}>{children}</Suspense>
      </main>
    </div>
  );
}
