import { requireServerUser } from '@/lib/tom-auth-server';

import AdminHeader from './_components/header';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireServerUser(['admin']);

  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <div className="mx-auto max-w-[1280px] px-4 py-4 sm:px-5 lg:px-6">
        <AdminHeader />
        <main className="mt-4 min-w-0">{children}</main>
      </div>
    </div>
  );
}
