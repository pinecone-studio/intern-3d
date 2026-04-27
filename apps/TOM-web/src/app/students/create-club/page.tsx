'use client';

import { useState } from 'react';

export default function CreateClubPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
    setName('');
    setDescription('');
    setRequirements('');
  };

  return (
    <div className="max-w-2xl rounded-2xl border border-[#e2eaf5] bg-white p-8 shadow-sm">
      {/* Header */}
      <h1 className="text-2xl font-bold text-[#0f1f3d]">Клуб нээх хүсэлт</h1>
      <p className="mt-1 text-sm text-[#6b7fa3]">
        Шалгуулах бүтэцтэй саналаа илгээнэ үү.
      </p>

      <div className="mt-7 space-y-6">
        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#0f1f3d]">
            Зорилго
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Юунд зориулж, яагаад нээж байгаа вэ?"
            rows={6}
            className="w-full resize-y h-11 rounded-xl border border-[#e2eaf5] bg-white px-4 py-3 text-sm text-[#0f1f3d] placeholder:text-[#b0bdd4] focus:border-[#1a3560] focus:outline-none focus:ring-2 focus:ring-[#1a3560]/10"
          />
        </div>
        {/* Name */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#0f1f3d]">Нэр</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Байгаль хамгаалах клуб"
            className="w-full rounded-xl border border-[#e2eaf5] bg-white px-4 py-3 text-sm text-[#0f1f3d] placeholder:text-[#b0bdd4] focus:border-[#1a3560] focus:outline-none focus:ring-2 focus:ring-[#1a3560]/10"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#0f1f3d]">
            Тайлбар
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Зорилго, уулзалтын давтамж, төлөвлөсөн үйл ажиллагаа"
            rows={6}
            className="w-full resize-y rounded-xl border border-[#e2eaf5] bg-white px-4 py-3 text-sm text-[#0f1f3d] placeholder:text-[#b0bdd4] focus:border-[#1a3560] focus:outline-none focus:ring-2 focus:ring-[#1a3560]/10"
          />
        </div>

        {/* Requirements */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#0f1f3d]">
            Шаардлага
          </label>
          <input
            type="text"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="XP / Түвшний шаардлага"
            className="w-full rounded-xl border border-[#e2eaf5] bg-white px-4 py-3 text-sm text-[#0f1f3d] placeholder:text-[#b0bdd4] focus:border-[#1a3560] focus:outline-none focus:ring-2 focus:ring-[#1a3560]/10"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="rounded-xl bg-[#1a3560] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#24478a] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Хүсэлт илгээх
          </button>
          {submitted && (
            <p className="text-sm font-medium text-[#3a8a3e]">
              ✓ Хүсэлт илгээгдлээ!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
