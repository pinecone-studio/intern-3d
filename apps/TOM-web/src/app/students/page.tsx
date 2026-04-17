import { StatusBadge, CapacityBar } from '@/app/_components';

export default function StudentDashboard() {
  return (
    <main className="max-w-6xl mx-auto p-6">
      <header className="bg-white border border-slate-200 rounded-2xl p-8 mb-6">
        <span className="inline-flex items-center gap-2 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full uppercase mb-4">
          Student Dashboard
        </span>
        <h1 className="text-3xl font-semibold text-slate-900">Browse Clubs</h1>
        <p className="text-slate-500 mt-2 text-sm">
          Pick a club that excites you. You can only send one request.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_320px] gap-6">
        <div className="space-x-4 grid grid-cols-2">
          {/* Club Card Example */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-colors h-fit">
            <div className="flex justify-between items-center mb-4">
              <StatusBadge type="open" text="Open" />
              <div>
                <h3 className="text-xl font-semibold">College Prep Club</h3>
              </div>
              <div className="flex gap-1">
                {' '}
                Angi: <p className=" font-bold  uppercase">303</p>
              </div>
            </div>

            <div className="border-t border-slate-100 py-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Teacher</span>
                <span className="font-medium">Tugs-Ochir</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Schedule</span>
                <span className="font-medium">Mon, Wed, Fri · 15:00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Capacity</span>
                <CapacityBar current={8} total={25} />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition-opacity">
                Send request
              </button>
              <button className="border border-slate-300 px-5 py-2 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-50">
                View details
              </button>
            </div>
          </div>
           <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-colors h-fit">
            <div className="flex justify-between items-center mb-4">
              <StatusBadge type="open" text="Open" />
              <div>
                <h3 className="text-xl font-semibold">College Prep Club</h3>
              </div>
              <div className="flex gap-1">
                {' '}
                Angi: <p className=" font-bold  uppercase">303</p>
              </div>
            </div>

            <div className="border-t border-slate-100 py-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Teacher</span>
                <span className="font-medium">Tugs-Ochir</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Schedule</span>
                <span className="font-medium">Mon, Wed, Fri · 15:00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Capacity</span>
                <CapacityBar current={8} total={25} />
              </div>
            </div>

            <div className="flex gap-3 mt-4">
              <button className="bg-indigo-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 transition-opacity">
                Send request
              </button>
              <button className="border border-slate-300 px-5 py-2 rounded-full text-sm font-medium text-slate-600 hover:bg-slate-50">
                View details
              </button>
            </div>
          </div>
          
        </div>

        <aside className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">
              Your Status
            </p>
            <h2 className="text-lg font-semibold">No request yet</h2>
            <p className="text-[13px] text-gray-500">
              Once you send a request, you'll wait here for the teacher to
              approve or reject it.
            </p>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex gap-3 bg-slate-50 p-3 rounded-lg">
                <span className="bg-indigo-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-[15px]">
                  1
                </span>{' '}
                Browse clubs
              </div>
              <div className="flex gap-3 bg-slate-50 p-3 rounded-lg">
                <span className="bg-indigo-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-[15px]">
                  2
                </span>{' '}
                Send request
              </div>
              <div className="flex gap-3 bg-slate-50 p-3 rounded-lg">
                <span className="bg-indigo-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-[15px]">
                  3
                </span>{' '}
                Wait for approval
              </div>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">
              Rules
            </p>
            <h2 className="text-lg font-semibold">How it works</h2>

            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex gap-3 bg-slate-50 p-3 rounded-lg border-l-4 border-indigo-600">
                {' '}
                You can only join one club
              </div>
              <div className="flex gap-3 bg-slate-50 p-3 rounded-lg border-l-4 border-indigo-600">
                {' '}
                Full clubs can't be requested
              </div>
              <div className="flex gap-3 bg-slate-50 p-3 rounded-lg border-l-4 border-indigo-600">
                After requesting, status is pending
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
