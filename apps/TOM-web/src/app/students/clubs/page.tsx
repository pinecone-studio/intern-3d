'use client';

import { useState } from 'react';

const mockClubs = [
  {
    id: '1',
    name: 'Роботик клуб',
    status: 'active',
    memberCount: 18,
    teacherName: 'Түвшин 3 · 250 XP',
    interestCount: 6,
    studentLimit: 7,
  },
  {
    id: '2',
    name: 'Мэтгэлцээний клуб',
    status: 'active',
    memberCount: 24,
    teacherName: 'Бүгдэд нээлттэй',
    interestCount: 7,
    studentLimit: 7,
  },
  {
    id: '3',
    name: 'Гэрэл зургийн клуб',
    status: 'idea',
    memberCount: 5,
    teacherName: 'Санал болгосон: Alex',
    interestCount: 3,
    studentLimit: 10,
  },
  {
    id: '4',
    name: 'Шатрын клуб',
    status: 'idea',
    memberCount: 8,
    teacherName: 'Санал болгосон: Sam',
    interestCount: 5,
    studentLimit: 12,
  },
];

export default function ClubsPage() {
  const [activeTab, setActiveTab] = useState<'active' | 'ideas'>('active');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredClubs = mockClubs.filter((c) =>
    activeTab === 'active' ? c.status === 'active' : c.status === 'idea'
  );

  return (
    <div className="rounded-2xl border border-[#e2eaf5] bg-white p-8 shadow-sm">
      {/* Header */}
      <h1 className="text-2xl font-bold text-[#0f1f3d]">Клубүүд</h1>
      <p className="mt-1 text-sm text-[#6b7fa3]">
        Идэвхтэй клубүүдийг үзэж танилцах эсвэл сонирхолд суурилсан шинэ санааг
        дэмжих.
      </p>

      {/* Tabs */}
      <div className="mt-5 inline-flex rounded-xl border border-[#e2eaf5] bg-white p-1">
        {(['active', 'ideas'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setSelectedId(null);
            }}
            className={`rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${
              activeTab === tab
                ? 'bg-white text-[#0f1f3d] shadow-sm ring-1 ring-[#e2eaf5]'
                : 'text-[#7a90af] hover:text-[#0f1f3d]'
            }`}
          >
            {tab === 'active' ? 'Идэвхтэй клубүүд' : 'Шинэ санаа'}
          </button>
        ))}
      </div>

      {/* Club cards */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {filteredClubs.map((club) => {
          const ratio = Math.min(club.interestCount / club.studentLimit, 1);
          const isSelected = selectedId === club.id;
          const statusLabel =
            club.status === 'active'
              ? 'Идэвхтэй'
              : club.status === 'idea'
              ? 'Санаа'
              : club.status;

          return (
            <button
              key={club.id}
              onClick={() => setSelectedId(isSelected ? null : club.id)}
              className={`rounded-xl border p-5 text-left transition-all ${
                isSelected
                  ? 'border-[#1a3560] ring-2 ring-[#1a3560]/20'
                  : 'border-[#e2eaf5] hover:border-[#b8cef0]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-bold text-[#0f1f3d]">
                  {club.name}
                </h3>
                <span className="rounded-md border border-[#86c78a] px-2 py-0.5 text-xs font-semibold text-[#3a8a3e]">
                  {statusLabel}
                </span>
              </div>

              <p className="mt-1.5 text-sm text-[#6b7fa3]">
                {club.memberCount} гишүүн · {club.teacherName}
              </p>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-[#6b7fa3]">
                  <span>Сонирхол</span>
                  <span>
                    {club.interestCount}/{club.studentLimit}
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#e8eef8]">
                  <div
                    className="h-full rounded-full bg-[#3b6de8] transition-all"
                    style={{ width: `${ratio * 100}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        <button
          disabled={!selectedId}
          className="rounded-xl bg-[#1a3560] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#24478a] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Сонгосон клубт нэгдэх
        </button>
        <button
          disabled={!selectedId}
          className="rounded-xl border border-[#e2eaf5] px-6 py-3 text-sm font-semibold text-[#0f1f3d] transition hover:bg-[#f4f7fb] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Шаардлага харах
        </button>
      </div>
    </div>
  );
}
