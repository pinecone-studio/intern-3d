import { requireServerUser } from '@/lib/tom-auth-server';

import StudentHeader from './_components/header';

export default async function StudentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireServerUser(['student']);

  return (
    <div className="min-h-screen bg-[#f4f7fb]">
      <div className="mx-auto max-w-6xl p-10">
        <StudentHeader />
        <main className="mt-6 min-w-0">{children}</main>
      </div>
    </div>
  );
}
