'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'
import type { RoomStatus } from '@/lib/types'

interface RoomFilterBarProps {
  selectedFloor: 3 | 4
  selectedStatus: RoomStatus | 'all'
  searchQuery: string
  onFloorChange: (_floor: 3 | 4) => void
  onStatusChange: (_status: RoomStatus | 'all') => void
  onSearchChange: (_query: string) => void
  embedded?: boolean
}

export function RoomFilterBar({
  selectedFloor,
  selectedStatus,
  searchQuery,
  onFloorChange,
  onStatusChange,
  onSearchChange,
  embedded = false,
}: RoomFilterBarProps) {
  return (
    <div className={embedded ? '' : 'rounded-md border border-border bg-card p-4'}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={selectedFloor === 3 ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFloorChange(3)}
            className="rounded-md"
          >
            3-р давхар
          </Button>
          <Button
            variant={selectedFloor === 4 ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFloorChange(4)}
            className="rounded-md"
          >
            4-р давхар
          </Button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select
            value={selectedStatus}
            onValueChange={(value) => onStatusChange(value as RoomStatus | 'all')}
          >
            <SelectTrigger className="w-full rounded-md sm:w-[160px]">
              <SelectValue placeholder="Төлөв сонгох" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Бүх төлөв</SelectItem>
              <SelectItem value="available">Нээлттэй</SelectItem>
              <SelectItem value="class">Хичээлтэй</SelectItem>
              <SelectItem value="club">Клубтэй</SelectItem>
              <SelectItem value="closed">Хаалттай</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Өрөө хайх..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full rounded-md pl-9 sm:w-[180px]"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
