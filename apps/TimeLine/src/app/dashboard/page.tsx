'use client'

import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { RoomCard } from '@/components/rooms/room-card'
import { RoomFilterBar } from '@/components/rooms/room-filter-bar'
import { Button } from '@/components/ui/button'
import { STATUS_CONFIG } from '@/lib/constants'
import { useRole } from '@/lib/role-context'
import type { Room, RoomStatus } from '@/lib/types'

type RoomsResponse = {
  rooms: Room[]
}

function buildRoomsUrl(floor: 3 | 4, search: string) {
  const params = new URLSearchParams({ floor: String(floor) })
  const trimmedSearch = search.trim()

  if (trimmedSearch) {
    params.set('search', trimmedSearch)
  }

  return `/api/rooms?${params.toString()}`
}

export default function DashboardPage() {
  const { role, user } = useRole()
  const [selectedFloor, setSelectedFloor] = useState<3 | 4>(3)
  const [selectedStatus, setSelectedStatus] = useState<RoomStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearchQuery = useDeferredValue(searchQuery)
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoadingRooms, setIsLoadingRooms] = useState(true)
  const [roomsError, setRoomsError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadRooms() {
      setIsLoadingRooms(true)
      setRoomsError(null)

      try {
        const response = await fetch(buildRoomsUrl(selectedFloor, deferredSearchQuery), {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error(`Rooms API failed with ${response.status}`)
        }

        const data = (await response.json()) as RoomsResponse
        setRooms(data.rooms)
      } catch (error) {
        if (controller.signal.aborted) return
        setRoomsError(error instanceof Error ? error.message : 'Өрөөнүүдийг ачаалж чадсангүй')
        setRooms([])
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingRooms(false)
        }
      }
    }

    void loadRooms()

    return () => controller.abort()
  }, [deferredSearchQuery, selectedFloor])

  const floorRooms = useMemo(() => {
    return rooms.filter(room => room.floor === selectedFloor)
  }, [rooms, selectedFloor])

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
        ) : isLoadingRooms ? (
          <div className="rounded-md border border-dashed border-border bg-background/60 p-8 text-center">
            <p className="text-muted-foreground">Өрөөнүүдийг ачаалж байна...</p>
          </div>
        ) : roomsError ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-8 text-center">
            <p className="font-medium text-destructive">Өрөөнүүдийг ачаалж чадсангүй</p>
            <p className="mt-2 text-sm text-muted-foreground">{roomsError}</p>
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
