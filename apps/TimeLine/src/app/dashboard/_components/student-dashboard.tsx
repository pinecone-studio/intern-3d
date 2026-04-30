'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { GET_SCHEDULER_DATA } from '@/app/dashboard/_lib/scheduler-queries'
import type { SchedulerQueryResult } from '@/app/dashboard/_lib/scheduler-types'
import { RoomCard } from '@/components/rooms/room-card'
import { Button } from '@/components/ui/button'
import { PineconeLoader } from '@/components/ui/pinecone-loader'
import { STATUS_CONFIG } from '@/lib/constants'
import { useRole } from '@/lib/role-context'
import { useTimelineLiveUpdates } from '@/lib/use-timeline-live-updates'
import type { RoomStatus } from '@/lib/types'

export function StudentDashboard() {
  const { role, user } = useRole()
  const [selectedFloor, setSelectedFloor] = useState<3 | 4>(3)
  const [selectedStatus, setSelectedStatus] = useState<RoomStatus | 'all'>('all')
  const { data, loading, error, refetch } = useQuery<Pick<SchedulerQueryResult, 'rooms'>>(GET_SCHEDULER_DATA, { variables: { floor: selectedFloor } })
  useTimelineLiveUpdates({ enabled: !loading, onEventsChanged: () => refetch() })

  const rooms = data?.rooms ?? []
  const filteredRooms = useMemo(() => rooms.filter((room) => selectedStatus === 'all' || room.status === selectedStatus), [rooms, selectedStatus])
  const roomSummary = useMemo(() => rooms.reduce((counts, room) => { if (room.status === 'club') counts.club += 1; else if (room.status === 'class') counts.class += 1; else if (room.status === 'closed') counts.unavailable += 1; else counts.open += 1; return counts }, { open: 0, class: 0, club: 0, unavailable: 0 }), [rooms])
  const userDevice = user?.assignedDevice
  const statusBadges = [{ key: 'class' as const, label: STATUS_CONFIG.class.label, count: roomSummary.class, activeClasses: 'border-blue-600 bg-blue-600 text-white hover:bg-blue-600/90', inactiveClasses: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' }, { key: 'club' as const, label: STATUS_CONFIG.club.label, count: roomSummary.club, activeClasses: 'border-violet-600 bg-violet-600 text-white hover:bg-violet-600/90', inactiveClasses: 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100' }, { key: 'available' as const, label: 'Open Lab', count: roomSummary.open, activeClasses: 'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-600/90', inactiveClasses: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100' }, { key: 'closed' as const, label: 'Event', count: roomSummary.unavailable, activeClasses: 'border-amber-600 bg-amber-600 text-white hover:bg-amber-600/90', inactiveClasses: 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100' }]

  return (
    <section className="overflow-hidden rounded-md border border-border bg-card">
      <div className="p-4 sm:p-5"><div className="mb-4 flex flex-wrap items-center gap-2"><Button type="button" variant={selectedFloor === 3 ? 'default' : 'outline'} size="sm" onClick={() => setSelectedFloor(3)} className="rounded-md">3-р давхар</Button><Button type="button" variant={selectedFloor === 4 ? 'default' : 'outline'} size="sm" onClick={() => setSelectedFloor(4)} className="rounded-md">4-р давхар</Button></div><div className="mb-4 flex flex-wrap items-center gap-2">{statusBadges.map((badge) => { const isActive = selectedStatus === badge.key; return <Button key={badge.key} type="button" variant="outline" size="sm" onClick={() => setSelectedStatus(isActive ? 'all' : badge.key)} className={isActive ? badge.activeClasses : badge.inactiveClasses}>{badge.label}: {badge.count}</Button> })}</div>{error ? <div className="rounded-md border border-destructive/40 bg-destructive/5 p-8 text-center"><p className="font-medium text-destructive">Өрөөнүүдийг ачаалж чадсангүй</p><p className="mt-2 text-sm text-muted-foreground">{error.message}</p><Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>Дахин оролдох</Button></div> : loading && !data ? <div className="rounded-md border border-dashed border-border bg-background/60 p-8"><PineconeLoader /></div> : filteredRooms.length > 0 ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filteredRooms.map((room) => <RoomCard key={room.id} room={room} showDeviceInfo={role === 'student' && userDevice != null && userDevice.roomId === room.id} assignedDeviceName={userDevice != null && userDevice.roomId === room.id ? userDevice.name : undefined} />)}</div> : <div className="rounded-md border border-dashed border-border bg-background/60 p-8 text-center"><p className="text-muted-foreground">Өрөө олдсонгүй</p></div>}</div>
    </section>
  )
}
