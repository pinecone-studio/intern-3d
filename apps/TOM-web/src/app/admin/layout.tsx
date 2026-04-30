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
      <div className="mx-auto max-w-6xl px-10 py-6">
        <AdminHeader />
        <main className="mt-4 min-w-0">{children}</main>
      </div>
    </div>
  );
}
