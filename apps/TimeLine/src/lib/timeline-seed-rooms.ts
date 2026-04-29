import type { RoomRow } from '@/db/schema'
import { FIXTURE_CREATED_AT } from '@/lib/timeline-seed-shared'

function seedRoom(id: string, name: string, floor: number, type: RoomRow['type'], capacity: number): RoomRow {
  return {
    id,
    name,
    floor,
    type,
    capacity,
    imacCount: type === 'event_hall' ? 0 : capacity,
    isActive: 1,
    notes: null,
    createdAt: FIXTURE_CREATED_AT,
  }
}

export const seedRooms: RoomRow[] = [
  seedRoom('room-301', '301', 3, 'lab', 32),
  seedRoom('room-302', '302', 3, 'lab', 28),
  seedRoom('room-303', '303', 3, 'lab', 30),
  seedRoom('room-304', '304', 3, 'lab', 26),
  seedRoom('room-305', '305', 3, 'lab', 24),
  seedRoom('room-hall-3', 'Event hall 3', 3, 'event_hall', 80),
  seedRoom('room-401', '401', 4, 'lab', 36),
  seedRoom('room-402', '402', 4, 'event_hall', 80),
  seedRoom('room-403', '403', 4, 'lab', 34),
]
