import { StatusBadge } from '@/app/_components';

export default function TeacherDashboard() {
  return (
    <main className="max-w-6xl mx-auto p-6">
      <header className="bg-white border border-slate-200 rounded-2xl p-8 mb-6">
         <span className="inline-flex items-center gap-2 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase mb-4">
          
          Teacher Dashboard
        </span>
        <h1 className="text-2xl font-semibold">Manage Requests</h1>
        <p className="text-slate-500 text-sm">Review who wants to join your clubs.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6">
        <aside className='space-y-6'>
        <div className="bg-white border border-slate-200 rounded-xl p-6 h-fit">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Your Club</p>
          <div className="flex justify-between items-center mt-2">
            <span className="font-semibold text-lg">English Club</span>
            <StatusBadge type="open" text="Active" />
          </div>
          <p className="text-xs text-slate-400 mt-1">8/12 seats filled</p>
        </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">
             Your clubs
            </p>
            <h2 className="text-lg font-semibold">Teacher responsibilities</h2>
            <p className="text-[13px] text-gray-500">
            You own the clubs assigned to you — keep an eye on capacity and admit the right students.
            </p>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex gap-3 bg-slate-50 p-3 rounded-lg">
                <span className="bg-indigo-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-[15px]">
                  1
                </span>{' '}
             Review incoming requests
              </div>
              <div className="flex gap-3 bg-slate-50 p-3 rounded-lg">
                <span className="bg-indigo-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-[15px]">
                  2
                </span>{' '}
               Approve or reject students
              </div>
              <div className="flex gap-3 bg-slate-50 p-3 rounded-lg">
                <span className="bg-indigo-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-[15px]">
                  3
                </span>{' '}
              Monitor attendance (coming soon)
              </div>
            </div>
          </div>
          </aside>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Request Queue</h2>
            <StatusBadge type="pending" text="3 Pending" />
          </div>

          <div className="space-y-3">
            <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="font-medium text-slate-900">Anu Erdene</p>
                <p className="text-xs text-slate-500 font-mono uppercase tracking-tight">Grade 6A • Wants speaking practice</p>
              </div>
              <div className="flex gap-2">
                <button className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold">Approve</button>
                <button className="bg-white border border-slate-200 px-4 py-1.5 rounded-full text-xs font-semibold text-slate-600">Reject</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
