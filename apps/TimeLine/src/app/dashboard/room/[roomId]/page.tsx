'use client'

import { use } from 'react'
import { RoomDetailContent } from '@/app/dashboard/room/[roomId]/_components/room-detail-content'

export default function RoomDetailPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params)
  return <RoomDetailContent roomId={roomId} />
}
