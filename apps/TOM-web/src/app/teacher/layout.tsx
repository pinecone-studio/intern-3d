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
      <div className="mx-auto max-w-6xl p-10">
        <TeacherHeader />
        <main className="mt-6 min-w-0">{children}</main>
      </div>
    </div>
  );
}
