'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GraduationCap } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();

  if (pathname === '/teacher') {
    return null;
  }

  return (
    <>
      <header className="fixed top-0 left-0 z-50 flex h-16 w-full items-center justify-between border-b border-gray-100 bg-white px-20 shadow-sm">
        <div className="flex justify-between" />

        <Link href="/" className="flex items-center gap-3">
          <GraduationCap className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-bold text-black">School Clubs</span>
        </Link>

        <div className="flex flex-1 justify-end">
          <button className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
            Sign in
          </button>
        </div>
      </header>
      <div className="h-16" aria-hidden="true" />
    </>
  );
}
