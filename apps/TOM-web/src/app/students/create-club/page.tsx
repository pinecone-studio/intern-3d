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
      <h1 className="text-2xl font-bold text-[#0f1f3d]">Create Club Request</h1>
      <p className="mt-1 text-sm text-[#6b7fa3]">
        Submit a structured proposal for review.
      </p>

      <div className="mt-7 space-y-6">
        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#0f1f3d]">
            Purpose
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Yund zoriulj yaagad neej bgaga"
            rows={6}
            className="w-full resize-y h-11 rounded-xl border border-[#e2eaf5] bg-white px-4 py-3 text-sm text-[#0f1f3d] placeholder:text-[#b0bdd4] focus:border-[#1a3560] focus:outline-none focus:ring-2 focus:ring-[#1a3560]/10"
          />
        </div>
        {/* Name */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#0f1f3d]">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Environmental Action Club"
            className="w-full rounded-xl border border-[#e2eaf5] bg-white px-4 py-3 text-sm text-[#0f1f3d] placeholder:text-[#b0bdd4] focus:border-[#1a3560] focus:outline-none focus:ring-2 focus:ring-[#1a3560]/10"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#0f1f3d]">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Purpose, meeting cadence, and planned activities"
            rows={6}
            className="w-full resize-y rounded-xl border border-[#e2eaf5] bg-white px-4 py-3 text-sm text-[#0f1f3d] placeholder:text-[#b0bdd4] focus:border-[#1a3560] focus:outline-none focus:ring-2 focus:ring-[#1a3560]/10"
          />
        </div>

        {/* Requirements */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-[#0f1f3d]">
            Requirements
          </label>
          <input
            type="text"
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="XP / Level requirements"
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
            Submit request
          </button>
          {submitted && (
            <p className="text-sm font-medium text-[#3a8a3e]">
              ✓ Request submitted!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
