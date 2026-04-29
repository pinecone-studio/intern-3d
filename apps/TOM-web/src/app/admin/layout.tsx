import { Suspense } from 'react';

import { requireServerUser } from '@/lib/tom-auth-server';

import SideBar from './_components/sideBar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireServerUser(['admin']);

  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <div className="mx-auto max-w-6xl p-10">
        <Suspense fallback={null}>
          <SideBar />
        </Suspense>

        <main className="mt-6 min-w-0">
          <Suspense fallback={null}>{children}</Suspense>
        </main>
      </div>
    </div>
  );
}
