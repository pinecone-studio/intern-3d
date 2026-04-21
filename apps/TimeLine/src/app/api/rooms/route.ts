import { NextResponse } from 'next/server'
import { listRooms } from '@/lib/timeline-rest'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const rooms = await listRooms({
    floor: searchParams.get('floor'),
    status: searchParams.get('status'),
    search: searchParams.get('search'),
  })

  return NextResponse.json({ rooms })
}
