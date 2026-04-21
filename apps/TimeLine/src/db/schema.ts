import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const roomsTable = sqliteTable('rooms', {
  id: text('id').primaryKey(),
  number: text('number').notNull().unique(),
  floor: integer('floor').notNull(),
  type: text('type').notNull(),
  status: text('status').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const scheduleEventsTable = sqliteTable('schedule_events', {
  id: text('id').primaryKey(),
  roomId: text('room_id')
    .notNull()
    .references(() => roomsTable.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  type: text('type').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  dayOfWeek: integer('day_of_week'),
  daysOfWeek: text('days_of_week').notNull(),
  date: text('date'),
  isOverride: integer('is_override').notNull(),
  instructor: text('instructor'),
  notes: text('notes'),
  validFrom: text('valid_from'),
  validUntil: text('valid_until'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const devicesTable = sqliteTable('devices', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  roomId: text('room_id')
    .notNull()
    .references(() => roomsTable.id, { onDelete: 'cascade' }),
  roomNumber: text('room_number').notNull(),
  status: text('status').notNull(),
  assignedTo: text('assigned_to'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export type RoomRow = typeof roomsTable.$inferSelect
export type ScheduleEventRow = typeof scheduleEventsTable.$inferSelect
export type DeviceRow = typeof devicesTable.$inferSelect
