'use client'

import { useMemo, useState } from 'react'
import { RoomCard } from '@/components/rooms/room-card'
import { RoomFilterBar } from '@/components/rooms/room-filter-bar'
import { createRooms } from '@/lib/mock-data'
import { useRole } from '@/lib/role-context'
import type { RoomStatus } from '@/lib/types'

export default function DashboardPage() {
  const { role, user } = useRole()
  const rooms = useMemo(() => createRooms(), [])

  const [selectedFloor, setSelectedFloor] = useState<3 | 4>(3)
  const [selectedStatus, setSelectedStatus] = useState<RoomStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredRooms = useMemo(() => {
    return rooms.filter(room => {
      if (room.floor !== selectedFloor) return false
      if (selectedStatus !== 'all' && room.status !== selectedStatus) return false
      if (searchQuery && !room.number.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [rooms, searchQuery, selectedFloor, selectedStatus])

  const isStudent = role === 'student'
  const userDevice = user?.assignedDevice
  const floorLabel = `${selectedFloor}-р давхар`

  return (
    <section className="overflow-hidden rounded-md border border-border bg-card">
      <div className="border-b border-border p-4 sm:p-5">
        <RoomFilterBar
          selectedFloor={selectedFloor}
          selectedStatus={selectedStatus}
          searchQuery={searchQuery}
          onFloorChange={setSelectedFloor}
          onStatusChange={setSelectedStatus}
          onSearchChange={setSearchQuery}
          embedded
        />
      </div>

      <div className="p-4 sm:p-5">
        <h2 className="mb-4 flex items-center justify-between gap-3 border-b border-border pb-3 text-lg font-semibold text-foreground">
          <span>{floorLabel}</span>
          <span className="text-sm font-normal text-muted-foreground">
            ({filteredRooms.length} өрөө)
          </span>
        </h2>

        {filteredRooms.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRooms.map(room => (
              <RoomCard
                key={room.id}
                room={room}
                showDeviceInfo={isStudent && userDevice?.roomId === room.id}
                assignedDeviceName={userDevice?.roomId === room.id ? userDevice.name : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-border bg-background/60 p-8 text-center">
            <p className="text-muted-foreground">Хайлтын үр дүн олдсонгүй</p>
          </div>
        )}
      </div>
    </section>
  )
}
