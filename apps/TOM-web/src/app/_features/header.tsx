import { GraduationCap } from "lucide-react";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-20 py-4 bg-white border-b border-gray-100 shadow-sm">
      {/* Left Spacer to keep title centered */}
      <div className="flex justify-between" />

      {/* Center Logo/Title */}
      <div className="flex  gap-3">
       <GraduationCap className="w-6 h-6 text-blue-600" />
        <h1 className="text-xl font-bold text-black">
          School Clubs
        </h1>
      </div>

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