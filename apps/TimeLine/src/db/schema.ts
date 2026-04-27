import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const usersTable = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  role: text('role').notNull(),
  createdAt: text('created_at').notNull(),
})

export const roomsTable = sqliteTable('rooms', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  floor: integer('floor').notNull(),
  type: text('type').notNull(),
  capacity: integer('capacity').notNull(),
  createdAt: text('created_at').notNull(),
})

export const schedulesTable = sqliteTable('schedules', {
  id: text('id').primaryKey(),
  roomId: text('room_id')
    .notNull()
    .references(() => roomsTable.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  type: text('type').notNull(),
  daysOfWeek: text('days_of_week').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  instructor: text('instructor'),
  notes: text('notes'),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  createdBy: text('created_by')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'restrict' }),
  createdAt: text('created_at').notNull(),
})

export const scheduleOverridesTable = sqliteTable('schedule_overrides', {
  id: text('id').primaryKey(),
  roomId: text('room_id')
    .notNull()
    .references(() => roomsTable.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  instructor: text('instructor'),
  notes: text('notes'),
  createdBy: text('created_by')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'restrict' }),
  createdAt: text('created_at').notNull(),
})

export const deviceAssignmentsTable = sqliteTable('device_assignments', {
  id: text('id').primaryKey(),
  roomId: text('room_id')
    .notNull()
    .references(() => roomsTable.id, { onDelete: 'cascade' }),
  deviceName: text('device_name').notNull(),
  userId: text('user_id').references(() => usersTable.id, { onDelete: 'set null' }),
})

export type UserRow = typeof usersTable.$inferSelect
export type RoomRow = typeof roomsTable.$inferSelect
export type ScheduleRow = typeof schedulesTable.$inferSelect
export type ScheduleOverrideRow = typeof scheduleOverridesTable.$inferSelect
export type DeviceAssignmentRow = typeof deviceAssignmentsTable.$inferSelect
