'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { RoomCard } from '@/components/rooms/room-card'
import { RoomFilterBar } from '@/components/rooms/room-filter-bar'
import { Button } from '@/components/ui/button'
import { STATUS_CONFIG } from '@/lib/constants'
import { useRole } from '@/lib/role-context'
import type { Room, RoomStatus } from '@/lib/types'

const GET_DASHBOARD_ROOMS = gql`
  query GetDashboardRooms($floor: Int, $search: String) {
    rooms(floor: $floor, search: $search) {
      id
      number
      floor
      type
      status
      currentEvent {
        id
        roomId
        title
        type
        startTime
        endTime
        dayOfWeek
        daysOfWeek
        date
        isOverride
        instructor
        notes
        validFrom
        validUntil
      }
      nextEvent {
        id
        roomId
        title
        type
        startTime
        endTime
        dayOfWeek
        daysOfWeek
        date
        isOverride
        instructor
        notes
        validFrom
        validUntil
      }
      devices {
        id
        name
        roomId
        roomNumber
        status
        assignedTo
      }
    }
  }
`

export default function DashboardPage() {
  const { role, user } = useRole()

  const [selectedFloor, setSelectedFloor] = useState<3 | 4>(3)
  const [selectedStatus, setSelectedStatus] = useState<RoomStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearchQuery = useDeferredValue(searchQuery)

  const { data, loading, error, refetch } = useQuery<{ rooms: Room[] }>(GET_DASHBOARD_ROOMS, {
    variables: {
      floor: selectedFloor,
      search: deferredSearchQuery.trim() || null,
    },
  })

  const floorRooms = data?.rooms ?? []

  const filteredRooms = useMemo(() => {
    return floorRooms.filter(room => {
      if (selectedStatus !== 'all' && room.status !== selectedStatus) return false
      return true
    })
  }, [floorRooms, selectedStatus])

  const roomSummary = useMemo(() => {
    const counts = {
      open: 0,
      class: 0,
      club: 0,
      unavailable: 0,
    }

    for (const room of floorRooms) {
      if (room.status === 'club') {
        counts.club += 1
        continue
      }

      if (room.status === 'class') {
        counts.class += 1
        continue
      }

      if (room.status === 'closed') {
        counts.unavailable += 1
        continue
      }

      counts.open += 1
    }

    return counts
  }, [floorRooms])

  const isStudent = role === 'student'
  const userDevice = user?.assignedDevice
  const statusBadges: Array<{
    key: RoomStatus
    label: string
    count: number
    activeClasses: string
    inactiveClasses: string
  }> = [
    {
      key: 'class',
      label: STATUS_CONFIG.class.label,
      count: roomSummary.class,
      activeClasses: 'border-blue-600 bg-blue-600 text-white hover:bg-blue-600/90',
      inactiveClasses: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
    },
    {
      key: 'club',
      label: STATUS_CONFIG.club.label,
      count: roomSummary.club,
      activeClasses: 'border-violet-600 bg-violet-600 text-white hover:bg-violet-600/90',
      inactiveClasses: 'border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100',
    },
    {
      key: 'available',
      label: 'Судлах / Open Lab',
      count: roomSummary.open,
      activeClasses: 'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-600/90',
      inactiveClasses: 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
    },
    {
      key: 'closed',
      label: 'Хаалттай / Unavailable',
      count: roomSummary.unavailable,
      activeClasses: 'border-rose-600 bg-rose-600 text-white hover:bg-rose-600/90',
      inactiveClasses: 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
    },
  ]

  return (
    <section className="overflow-hidden rounded-md border border-border bg-card">
      <div className="border-b border-border p-4 sm:p-5">
        <RoomFilterBar
          selectedFloor={selectedFloor}
          selectedStatus={selectedStatus}
          searchQuery={searchQuery}
          roomCount={filteredRooms.length}
          onFloorChange={setSelectedFloor}
          onStatusChange={setSelectedStatus}
          onSearchChange={setSearchQuery}
          showScheduleLink={role === 'admin'}
          embedded
        />
      </div>

      <div className="p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {statusBadges.map((badge) => {
            const isActive = selectedStatus === badge.key

            return (
              <Button
                key={badge.key}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedStatus(isActive ? 'all' : badge.key)}
                className={isActive ? badge.activeClasses : badge.inactiveClasses}
              >
                {badge.label}: {badge.count}
              </Button>
            )
          })}
        </div>

        {error ? (
          <div className="rounded-md border border-dashed border-destructive/40 bg-background/60 p-8 text-center">
            <p className="text-sm text-muted-foreground">Өгөгдөл татахад алдаа гарлаа.</p>
            <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
              Дахин оролдох
            </Button>
          </div>
        ) : loading && !data ? (
          <div className="rounded-md border border-dashed border-border bg-background/60 p-8 text-center">
            <p className="text-muted-foreground">Өрөөнүүдийг ачаалж байна...</p>
          </div>
        ) : filteredRooms.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredRooms.map(room => (
              <RoomCard
                key={room.id}
                room={room}
                showDeviceInfo={isStudent && userDevice != null && userDevice.roomId === room.id}
                assignedDeviceName={userDevice != null && userDevice.roomId === room.id ? userDevice.name : undefined}
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
