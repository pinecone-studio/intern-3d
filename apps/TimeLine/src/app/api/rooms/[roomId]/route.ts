import { NextResponse } from 'next/server'
import { getRoomDetail } from '@/lib/timeline-rest'

export async function GET(_request: Request, context: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await context.params
  const result = await getRoomDetail(roomId)

  if (!result) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  }

  return NextResponse.json(result)
}
