import { sql } from 'drizzle-orm'
import { getDrizzleDb } from '@/db/client'
import { devicesTable, roomsTable, scheduleEventsTable } from '@/db/schema'
import { createRooms, scheduleEvents as mockScheduleEvents } from '@/lib/mock-data'

export async function seedTimelineDatabase(options: { reset?: boolean } = {}) {
  const db = getDrizzleDb()

  if (options.reset) {
    await db.delete(devicesTable)
    await db.delete(scheduleEventsTable)
    await db.delete(roomsTable)
  }

  const existingRooms = await db.select({ count: sql<number>`count(*)` }).from(roomsTable)
  if ((existingRooms[0]?.count ?? 0) > 0 && !options.reset) {
    return { seeded: false, reason: 'rooms already exist' as const }
  }

  const rooms = createRooms()
  const devices = rooms.flatMap(room => room.devices)
  const now = new Date().toISOString()

  await db.insert(roomsTable).values(
    rooms.map(room => ({
      id: room.id,
      number: room.number,
      floor: room.floor,
      type: room.type,
      status: room.status,
      createdAt: now,
      updatedAt: now,
    }))
  )

  await db.insert(scheduleEventsTable).values(
    mockScheduleEvents.map(event => ({
      id: event.id,
      roomId: event.roomId,
      title: event.title,
      type: event.type,
      startTime: event.startTime,
      endTime: event.endTime,
      dayOfWeek: event.dayOfWeek,
      daysOfWeek: JSON.stringify(event.daysOfWeek),
      date: event.date ?? null,
      isOverride: event.isOverride ? 1 : 0,
      instructor: event.instructor ?? null,
      notes: event.notes ?? null,
      validFrom: event.validFrom ?? null,
      validUntil: event.validUntil ?? null,
      createdAt: now,
      updatedAt: now,
    }))
  )

  if (devices.length > 0) {
    await db.insert(devicesTable).values(
      devices.map(device => ({
        id: device.id,
        name: device.name,
        roomId: device.roomId,
        roomNumber: device.roomNumber,
        status: device.status,
        assignedTo: device.assignedTo ?? null,
        createdAt: now,
        updatedAt: now,
      }))
    )
  }

  return {
    seeded: true,
    rooms: rooms.length,
    events: mockScheduleEvents.length,
    devices: devices.length,
  }
}
