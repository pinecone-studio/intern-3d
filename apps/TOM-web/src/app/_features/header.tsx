import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 z-50 flex h-16 w-full items-center justify-between border-b border-gray-100 bg-white px-20 shadow-sm">
      {/* Left Spacer to keep title centered */}
      <div className="flex justify-between" />

      {/* Center Logo/Title */}
      <Link href="/" className="flex items-center gap-3">
          <GraduationCap className="w-6 h-6 text-blue-600" />
          <span className="text-xl font-bold text-black">School Clubs</span>
      </Link>

      {/* Right Action Area */}
      <div className="flex justify-end flex-1">
        <button 
          className="px-5 py-2 text-sm font-semibold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
        
        >
          Sign in
        </button>
      </div>
    </header>
  );
}
