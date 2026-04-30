'use client'

import { useEffect, useState } from 'react'

import type { Announcement, AnnouncementType } from '@/lib/tom-types'

type Props = {
  type?: AnnouncementType
}

export function AnnouncementFeed({ type }: Props) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const url = type ? `/api/announcements?type=${type}` : '/api/announcements'
    fetch(url)
      .then((r) => r.json() as Promise<{ announcements: Announcement[] }>)
      .then((data) => {
        if (!cancelled) setAnnouncements(data.announcements)
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [type])

  if (loading) return <div className="text-sm text-gray-400">Loading...</div>
  if (announcements.length === 0)
    return <div className="text-sm text-gray-400">No announcements.</div>

  return (
    <div className="space-y-3">
      {announcements.map((a) => (
        <div key={a.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              {a.type}
            </span>
            <span className="text-xs text-gray-400">
              {new Date(a.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h3 className="font-semibold text-gray-800">{a.title}</h3>
          {a.content && <p className="mt-1 text-sm text-gray-600">{a.content}</p>}
        </div>
      ))}
    </div>
  )
}
