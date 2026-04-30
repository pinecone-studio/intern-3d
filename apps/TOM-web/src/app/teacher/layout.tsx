import { requireServerUser } from '@/lib/tom-auth-server';

import TeacherHeader from './_components/header';

export default async function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireServerUser(['teacher']);

  return (
    <div className="tom-teacher-shell min-h-screen bg-[#f4f7fb]">
      <div className="mx-auto max-w-6xl px-10 py-6">
        <TeacherHeader />
        <main className="mt-4 min-w-0">{children}</main>
      </div>
    </div>
  );
}
