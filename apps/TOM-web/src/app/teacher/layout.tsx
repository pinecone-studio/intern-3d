import { requireServerUser } from '@/lib/tom-auth-server';

import SideBar from './_components/sideBar';

export default async function StudentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireServerUser(['teacher']);

  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <aside className="fixed left-0 top-0 z-[60] h-screen w-56">
        <SideBar />
      </aside>

      <main className="ml-56 min-h-screen min-w-0 p-10">{children}</main>
    </div>
  );
}
