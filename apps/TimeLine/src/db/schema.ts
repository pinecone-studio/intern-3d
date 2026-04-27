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
  imacCount: integer('imac_count').notNull().default(25),
  isActive: integer('is_active').notNull().default(1),
  notes: text('notes'),
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

export const cohortsTable = sqliteTable('cohorts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  roomId: text('room_id')
    .notNull()
    .references(() => roomsTable.id, { onDelete: 'restrict' }),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  status: text('status').notNull().default('upcoming'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const scheduleBlocksTable = sqliteTable('schedule_blocks', {
  id: text('id').primaryKey(),
  roomId: text('room_id')
    .notNull()
    .references(() => roomsTable.id, { onDelete: 'cascade' }),
  cohortId: text('cohort_id').references(() => cohortsTable.id, { onDelete: 'set null' }),
  type: text('type').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  color: text('color'),
  organizer: text('organizer'),
  startHour: integer('start_hour').notNull(),
  endHour: integer('end_hour').notNull(),
  recurrence: text('recurrence').notNull().default('one_time'),
  specificDate: text('specific_date'),
  daysOfWeek: text('days_of_week'),
  validFrom: text('valid_from').notNull(),
  validUntil: text('valid_until'),
  isActive: integer('is_active').notNull().default(1),
  createdBy: text('created_by').references(() => usersTable.id, { onDelete: 'set null' }),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export type UserRow = typeof usersTable.$inferSelect
export type RoomRow = typeof roomsTable.$inferSelect
export type ScheduleRow = typeof schedulesTable.$inferSelect
export type ScheduleOverrideRow = typeof scheduleOverridesTable.$inferSelect
export type DeviceAssignmentRow = typeof deviceAssignmentsTable.$inferSelect
export type CohortRow = typeof cohortsTable.$inferSelect
export type ScheduleBlockRow = typeof scheduleBlocksTable.$inferSelect
