import { getTomDb } from '@/lib/d1'
import { seedActiveClubs, seedClubRequests, seedManagedUsers } from '@/lib/tom-seed-data'
import { deleteSessionsForUser } from '@/lib/tom-session'
import type {
  Badge,
  BadgeInput,
  Club,
  ClubInput,
  ClubMembership,
  ClubRequest,
  ClubRequestInput,
  ClubStatus,
  EventInput,
  EventPost,
  EventPostComment,
  EventStatus,
  ManagedUser,
  PublicUser,
  RequestStatus,
  SchoolEvent,
  TomFormOptions,
  UserBadge,
  UserRole,
  UserInput,
  XpLog,
  XpSource,
  Announcement,
  AnnouncementInput,
  AnnouncementType,
} from '@/lib/tom-types'

const seedClubRequestIds = new Set(
  seedClubRequests.map((request) => request.id)
)
const seedActiveClubIds = new Set(seedActiveClubs.map((club) => club.id))

type ClubRow = {
  id: string
  name: string
  description: string
  teacher_name: string
  created_by: string
  interest_count: number
  member_limit: number
  member_count: number
  grade_range: string
  allowed_days: string
  start_date: string
  end_date: string
  note: string
  status: ClubStatus
  category: string
  verified: number
  created_at: string
  updated_at: string
}

type ClubRequestRow = {
  id: string
  club_name: string
  requested_by: string
  teacher_name: string
  created_by: string
  note: string
  interest_count: number
  student_limit: number
  grade_range: string
  allowed_days: string
  start_date: string
  end_date: string
  status: RequestStatus
  club_status: ClubStatus
  flagged_reason: string | null
  created_at: string
  updated_at: string
}

type UserRow = {
  id: string
  full_name: string
  email: string
  role: ManagedUser['role']
  teacher_profile_name: string
  account_status: ManagedUser['accountStatus']
  reason: string
  last_active: string
  club_count: number
  notes: string
  created_at: string
  updated_at: string
}

type ClubMembershipRow = {
  id: string
  club_id: string
  user_id: string
  joined_at: string
}

type FormOptionCategory = 'teacher' | 'allowed_day' | 'grade_range'

type FormOptionRow = {
  category: FormOptionCategory
  value: string
}

const defaultDate = '2026-04-22'

function nowIso() {
  return new Date().toISOString()
}

function toBoolInt(value: boolean) {
  return value ? 1 : 0
}

function mapClubRow(row: ClubRow): Club {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    teacherName: row.teacher_name,
    createdBy: row.created_by,
    interestCount: row.interest_count,
    studentLimit: row.member_limit,
    memberCount: row.member_count,
    gradeRange: row.grade_range,
    allowedDays: row.allowed_days,
    startDate: row.start_date,
    endDate: row.end_date,
    note: row.note,
    status: row.status,
    category: row.category,
    verified: row.verified === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapRequestRow(row: ClubRequestRow): ClubRequest {
  return {
    id: row.id,
    clubName: row.club_name,
    teacherName: row.teacher_name,
    createdBy: row.created_by || row.requested_by,
    interestCount: row.interest_count,
    studentLimit: row.student_limit,
    gradeRange: row.grade_range,
    allowedDays: row.allowed_days,
    startDate: row.start_date,
    endDate: row.end_date,
    note: row.note,
    requestStatus: row.status,
    clubStatus: row.club_status,
    flaggedReason: row.flagged_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapUserRow(row: UserRow): ManagedUser {
  return {
    id: row.id,
    name: row.full_name,
    email: row.email,
    role: row.role,
    teacherProfileName: row.teacher_profile_name || undefined,
    accountStatus: row.account_status,
    reason: row.reason,
    lastActive: row.last_active,
    clubCount: row.club_count,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapClubMembershipRow(row: ClubMembershipRow): ClubMembership {
  return {
    id: row.id,
    clubId: row.club_id,
    userId: row.user_id,
    joinedAt: row.joined_at,
  }
}

export async function getFormOptions(): Promise<TomFormOptions> {
  const db = getTomDb()
  const result = await db
    .prepare(
      'SELECT category, value FROM form_options ORDER BY category ASC, sort_order ASC, value ASC'
    )
    .all<FormOptionRow>()

  const options: TomFormOptions = {
    teachers: [],
    teacherOptions: [],
    allowedDays: [],
    gradeRanges: [],
  }

  for (const row of result.results) {
    if (row.category === 'teacher') {
      options.teachers.push(row.value)
    } else if (row.category === 'allowed_day') {
      options.allowedDays.push(row.value)
    } else if (row.category === 'grade_range') {
      options.gradeRanges.push(row.value)
    }
  }

  const teacherResult = await db
    .prepare(
      `SELECT id, full_name, teacher_profile_name
       FROM users
       WHERE role = 'teacher' AND account_status = 'active'
       ORDER BY full_name ASC`
    )
    .all<Pick<UserRow, 'id' | 'full_name' | 'teacher_profile_name'>>()

  options.teacherOptions = teacherResult.results.map((teacher) => ({
    id: teacher.id,
    name: teacher.teacher_profile_name || teacher.full_name,
  }))

  if (options.teacherOptions.length > 0) {
    options.teachers = options.teacherOptions.map((teacher) => teacher.name)
  }

  return options
}

function normalizeClub(input: ClubInput, current?: Club): Club {
  const now = nowIso()

  return {
    id: current?.id ?? crypto.randomUUID(),
    name: input.name,
    description: input.description ?? current?.description ?? '',
    teacherName: input.teacherName ?? current?.teacherName ?? 'Тодорхойгүй багш',
    createdBy: input.createdBy ?? current?.createdBy ?? 'TOM system',
    interestCount: input.interestCount ?? current?.interestCount ?? 0,
    studentLimit: input.studentLimit ?? current?.studentLimit ?? 20,
    memberCount: input.memberCount ?? current?.memberCount ?? 0,
    gradeRange: input.gradeRange ?? current?.gradeRange ?? '',
    allowedDays: input.allowedDays ?? current?.allowedDays ?? '',
    startDate: input.startDate ?? current?.startDate ?? '',
    endDate: input.endDate ?? current?.endDate ?? '',
    note: input.note ?? current?.note ?? '',
    status: input.status ?? current?.status ?? 'draft',
    category: input.category ?? current?.category ?? 'general',
    verified: input.verified ?? current?.verified ?? false,
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
  }
}

function normalizeRequest(input: ClubRequestInput, current?: ClubRequest): ClubRequest {
  const now = nowIso()

  return {
    id: current?.id ?? crypto.randomUUID(),
    clubName: input.clubName,
    teacherName: input.teacherName ?? current?.teacherName ?? 'Тодорхойгүй багш',
    createdBy: input.createdBy ?? current?.createdBy ?? 'TOM system',
    interestCount: input.interestCount ?? current?.interestCount ?? 0,
    studentLimit: input.studentLimit ?? current?.studentLimit ?? 20,
    gradeRange: input.gradeRange ?? current?.gradeRange ?? '',
    allowedDays: input.allowedDays ?? current?.allowedDays ?? '',
    startDate: input.startDate ?? current?.startDate ?? '',
    endDate: input.endDate ?? current?.endDate ?? '',
    note: input.note ?? current?.note ?? '',
    requestStatus: input.requestStatus ?? current?.requestStatus ?? 'pending',
    clubStatus: input.clubStatus ?? current?.clubStatus ?? 'pending',
    flaggedReason: input.flaggedReason ?? current?.flaggedReason ?? null,
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
  }
}

function normalizeUser(input: UserInput, current?: ManagedUser): ManagedUser {
  const now = nowIso()

  return {
    id: current?.id ?? crypto.randomUUID(),
    name: input.name,
    email: input.email,
    role: input.role ?? current?.role ?? 'student',
    teacherProfileName: input.teacherProfileName ?? current?.teacherProfileName ?? '',
    accountStatus: input.accountStatus ?? current?.accountStatus ?? 'active',
    reason: input.reason ?? current?.reason ?? '',
    lastActive: input.lastActive ?? current?.lastActive ?? defaultDate,
    clubCount: input.clubCount ?? current?.clubCount ?? 0,
    notes: input.notes ?? current?.notes ?? '',
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
  }
}

export async function listClubs(params: {
  status?: string | null
  teacher?: string | null
  q?: string | null
} = {}) {
  const db = getTomDb()
  const filters: string[] = []
  const bindings: Array<string | number> = []

  filters.push("status <> 'spam'")
  if (seedActiveClubIds.size > 0) {
    filters.push(
      `id NOT IN (${Array.from(seedActiveClubIds)
        .map(() => '?')
        .join(', ')})`
    )
    bindings.push(...seedActiveClubIds)
  }

  if (params.status) {
    filters.push('status = ?')
    bindings.push(params.status)
  }

  if (params.teacher) {
    filters.push('teacher_name LIKE ?')
    bindings.push(`%${params.teacher}%`)
  }

  if (params.q) {
    filters.push('(name LIKE ? OR category LIKE ? OR teacher_name LIKE ?)')
    bindings.push(`%${params.q}%`, `%${params.q}%`, `%${params.q}%`)
  }

  const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : ''
  const result = await db
    .prepare(`SELECT * FROM clubs ${where} ORDER BY updated_at DESC, name ASC`)
    .bind(...bindings)
    .all<ClubRow>()

  return result.results.map(mapClubRow)
}

export async function getClub(id: string) {
  const db = getTomDb()
  const row = await db.prepare('SELECT * FROM clubs WHERE id = ? LIMIT 1').bind(id).first<ClubRow>()
  return row ? mapClubRow(row) : null
}

export async function upsertClub(input: ClubInput, id?: string) {
  const db = getTomDb()
  const current = id ? await getClub(id) : null
  const club = normalizeClub({ ...input, name: input.name }, current ?? undefined)

  await db
    .prepare(
      `INSERT INTO clubs (
        id, name, description, teacher_name, created_by, interest_count, member_limit, member_count,
        grade_range, allowed_days, start_date, end_date, note, status, category, verified, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        description = excluded.description,
        teacher_name = excluded.teacher_name,
        created_by = excluded.created_by,
        interest_count = excluded.interest_count,
        member_limit = excluded.member_limit,
        member_count = excluded.member_count,
        grade_range = excluded.grade_range,
        allowed_days = excluded.allowed_days,
        start_date = excluded.start_date,
        end_date = excluded.end_date,
        note = excluded.note,
        status = excluded.status,
        category = excluded.category,
        verified = excluded.verified,
        updated_at = excluded.updated_at`
    )
    .bind(
      club.id,
      club.name,
      club.description,
      club.teacherName,
      club.createdBy,
      club.interestCount,
      club.studentLimit,
      club.memberCount,
      club.gradeRange,
      club.allowedDays,
      club.startDate,
      club.endDate,
      club.note,
      club.status,
      club.category,
      toBoolInt(club.verified),
      club.createdAt,
      club.updatedAt
    )
    .run()

  return club
}

export async function deleteClub(id: string) {
  const db = getTomDb()
  const current = await getClub(id)
  if (!current) return false

  await db.prepare('DELETE FROM clubs WHERE id = ?').bind(id).run()
  return true
}

async function syncClubMembershipCounts(clubId: string, userId: string) {
  const db = getTomDb()
  const [clubMembershipCount, userMembershipCount] = await Promise.all([
    db
      .prepare('SELECT COUNT(*) AS count FROM club_memberships WHERE club_id = ?')
      .bind(clubId)
      .first<{ count: number }>(),
    db
      .prepare('SELECT COUNT(*) AS count FROM club_memberships WHERE user_id = ?')
      .bind(userId)
      .first<{ count: number }>(),
  ])

  await Promise.all([
    db
      .prepare('UPDATE clubs SET member_count = ?, updated_at = ? WHERE id = ?')
      .bind(clubMembershipCount?.count ?? 0, nowIso(), clubId)
      .run(),
    db
      .prepare('UPDATE users SET club_count = ?, updated_at = ? WHERE id = ?')
      .bind(userMembershipCount?.count ?? 0, nowIso(), userId)
      .run(),
  ])
}

export async function listClubMembershipsForUser(userId: string): Promise<ClubMembership[]> {
  const db = getTomDb()
  const result = await db
    .prepare('SELECT * FROM club_memberships WHERE user_id = ? ORDER BY joined_at ASC')
    .bind(userId)
    .all<ClubMembershipRow>()

  return result.results.map(mapClubMembershipRow)
}

export async function listClubsByIds(ids: string[]): Promise<Club[]> {
  if (ids.length === 0) return []

  const db = getTomDb()
  const placeholders = ids.map(() => '?').join(', ')
  const result = await db
    .prepare(
      `SELECT * FROM clubs
       WHERE id IN (${placeholders})
       ORDER BY name ASC`
    )
    .bind(...ids)
    .all<ClubRow>()

  return result.results.map(mapClubRow)
}

export async function joinClub(clubId: string, userId: string): Promise<ClubMembership | null> {
  const db = getTomDb()
  const now = nowIso()

  await db
    .prepare(
      `INSERT OR IGNORE INTO club_memberships (id, club_id, user_id, joined_at)
       VALUES (lower(hex(randomblob(16))), ?, ?, ?)`
    )
    .bind(clubId, userId, now)
    .run()

  await syncClubMembershipCounts(clubId, userId)

  const row = await db
    .prepare('SELECT * FROM club_memberships WHERE club_id = ? AND user_id = ? LIMIT 1')
    .bind(clubId, userId)
    .first<ClubMembershipRow>()

  return row ? mapClubMembershipRow(row) : null
}

export async function leaveClub(clubId: string, userId: string): Promise<void> {
  const db = getTomDb()

  await db
    .prepare('DELETE FROM club_memberships WHERE club_id = ? AND user_id = ?')
    .bind(clubId, userId)
    .run()

  await syncClubMembershipCounts(clubId, userId)
}

export async function listClubRequests(params: {
  requestStatus?: string | null
  clubStatus?: string | null
  teacher?: string | null
  createdBy?: string | null
  q?: string | null
} = {}) {
  const db = getTomDb()
  const filters: string[] = []
  const bindings: Array<string | number> = []

  filters.push("club_status <> 'spam'")
  if (seedClubRequestIds.size > 0) {
    filters.push(
      `id NOT IN (${Array.from(seedClubRequestIds)
        .map(() => '?')
        .join(', ')})`
    )
    bindings.push(...seedClubRequestIds)
  }

  if (params.requestStatus) {
    filters.push('status = ?')
    bindings.push(params.requestStatus)
  }

  if (params.clubStatus) {
    filters.push('club_status = ?')
    bindings.push(params.clubStatus)
  }

  if (params.teacher) {
    filters.push('teacher_name LIKE ?')
    bindings.push(`%${params.teacher}%`)
  }

  if (params.createdBy) {
    filters.push('created_by = ?')
    bindings.push(params.createdBy)
  }

  if (params.q) {
    filters.push('(club_name LIKE ? OR created_by LIKE ? OR teacher_name LIKE ?)')
    bindings.push(`%${params.q}%`, `%${params.q}%`, `%${params.q}%`)
  }

  const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : ''
  const result = await db
    .prepare(`SELECT * FROM club_requests ${where} ORDER BY updated_at DESC, club_name ASC`)
    .bind(...bindings)
    .all<ClubRequestRow>()

  return result.results.map(mapRequestRow)
}

export async function getClubRequest(id: string) {
  const db = getTomDb()
  const row = await db.prepare('SELECT * FROM club_requests WHERE id = ? LIMIT 1').bind(id).first<ClubRequestRow>()
  return row ? mapRequestRow(row) : null
}

export async function upsertClubRequest(input: ClubRequestInput, id?: string) {
  const db = getTomDb()
  const current = id ? await getClubRequest(id) : null
  const request = normalizeRequest({ ...input, clubName: input.clubName }, current ?? undefined)

  await db
    .prepare(
      `INSERT INTO club_requests (
        id, club_name, requested_by, teacher_name, created_by, note, interest_count, student_limit, grade_range,
        allowed_days, start_date, end_date, status, club_status, flagged_reason, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        club_name = excluded.club_name,
        requested_by = excluded.requested_by,
        teacher_name = excluded.teacher_name,
        created_by = excluded.created_by,
        note = excluded.note,
        interest_count = excluded.interest_count,
        student_limit = excluded.student_limit,
        grade_range = excluded.grade_range,
        allowed_days = excluded.allowed_days,
        start_date = excluded.start_date,
        end_date = excluded.end_date,
        status = excluded.status,
        club_status = excluded.club_status,
        flagged_reason = excluded.flagged_reason,
        updated_at = excluded.updated_at`
    )
    .bind(
      request.id,
      request.clubName,
      request.createdBy,
      request.teacherName,
      request.createdBy,
      request.note,
      request.interestCount,
      request.studentLimit,
      request.gradeRange,
      request.allowedDays,
      request.startDate,
      request.endDate,
      request.requestStatus,
      request.clubStatus,
      request.flaggedReason,
      request.createdAt,
      request.updatedAt
    )
    .run()

  return request
}

export async function deleteClubRequest(id: string) {
  const db = getTomDb()
  const current = await getClubRequest(id)
  if (!current) return false

  await db.prepare('DELETE FROM club_requests WHERE id = ?').bind(id).run()
  return true
}

export async function approveClubRequest(id: string) {
  const request = await getClubRequest(id)
  if (!request) return null

  const approvedRequest = await upsertClubRequest(
    {
      clubName: request.clubName,
      teacherName: request.teacherName,
      createdBy: request.createdBy,
      interestCount: request.interestCount,
      studentLimit: request.studentLimit,
      gradeRange: request.gradeRange,
      allowedDays: request.allowedDays,
      startDate: request.startDate,
      endDate: request.endDate,
      note: request.note,
      requestStatus: 'approved',
      clubStatus: 'active',
      flaggedReason: request.flaggedReason ?? null,
    },
    id
  )

  const club = await upsertClub({
    name: approvedRequest.clubName,
    teacherName: approvedRequest.teacherName,
    createdBy: approvedRequest.createdBy,
    interestCount: approvedRequest.interestCount,
    studentLimit: approvedRequest.studentLimit,
    gradeRange: approvedRequest.gradeRange,
    allowedDays: approvedRequest.allowedDays,
    startDate: approvedRequest.startDate,
    endDate: approvedRequest.endDate,
    note: approvedRequest.note,
    status: 'active',
    category: 'general',
    verified: false,
    memberCount: 0,
    description: approvedRequest.note,
  }, id)

  return { request: approvedRequest, club }
}

export async function rejectClubRequest(id: string) {
  const request = await getClubRequest(id)
  if (!request) return null

  return upsertClubRequest(
    {
      clubName: request.clubName,
      teacherName: request.teacherName,
      createdBy: request.createdBy,
      interestCount: request.interestCount,
      studentLimit: request.studentLimit,
      gradeRange: request.gradeRange,
      allowedDays: request.allowedDays,
      startDate: request.startDate,
      endDate: request.endDate,
      note: request.note,
      requestStatus: 'rejected',
      clubStatus: 'paused',
      flaggedReason: request.flaggedReason ?? null,
    },
    id
  )
}

export async function listUsers(params: {
  role?: string | null
  accountStatus?: string | null
  q?: string | null
} = {}) {
  const db = getTomDb()
  const filters: string[] = []
  const bindings: Array<string | number> = []

  if (params.role) {
    filters.push('role = ?')
    bindings.push(params.role)
  }

  if (params.accountStatus) {
    filters.push('account_status = ?')
    bindings.push(params.accountStatus)
  }

  if (params.q) {
    filters.push('(full_name LIKE ? OR email LIKE ?)')
    bindings.push(`%${params.q}%`, `%${params.q}%`)
  }

  const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : ''
  const result = await db
    .prepare(`SELECT * FROM users ${where} ORDER BY updated_at DESC, full_name ASC`)
    .bind(...bindings)
    .all<UserRow>()

  return result.results.map(mapUserRow)
}

export async function getUser(id: string) {
  const db = getTomDb()
  const row = await db.prepare('SELECT * FROM users WHERE id = ? LIMIT 1').bind(id).first<UserRow>()
  return row ? mapUserRow(row) : null
}

export async function getUserByEmail(email: string) {
  const db = getTomDb()
  const row = await db.prepare('SELECT * FROM users WHERE email = ? LIMIT 1').bind(email).first<UserRow>()
  return row ? mapUserRow(row) : null
}

export async function upsertUser(input: UserInput, id?: string) {
  const db = getTomDb()
  const current = id ? await getUser(id) : null
  const user = normalizeUser({ ...input, name: input.name, email: input.email }, current ?? undefined)

  await db
    .prepare(
      `INSERT INTO users (
        id, full_name, email, role, teacher_profile_name, account_status, reason, last_active, club_count, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        full_name = excluded.full_name,
        email = excluded.email,
        role = excluded.role,
        teacher_profile_name = excluded.teacher_profile_name,
        account_status = excluded.account_status,
        reason = excluded.reason,
        last_active = excluded.last_active,
        club_count = excluded.club_count,
        notes = excluded.notes,
        updated_at = excluded.updated_at`
    )
    .bind(
      user.id,
      user.name,
      user.email,
      user.role,
      user.teacherProfileName ?? '',
      user.accountStatus,
      user.reason,
      user.lastActive,
      user.clubCount,
      user.notes,
      user.createdAt,
      user.updatedAt
    )
    .run()

  return user
}

export async function deleteUser(id: string) {
  const db = getTomDb()
  const current = await getUser(id)
  if (!current) return false

  await deleteSessionsForUser(id)
  await db.prepare('DELETE FROM users WHERE id = ?').bind(id).run()

  return true
}

export async function getDashboardSummary() {
  const db = getTomDb()
  const [usersCount, activeClubsCount, pendingRequestsCount, thresholdReachedCount] =
    await Promise.all([
      db.prepare('SELECT COUNT(*) AS count FROM users').first<{ count: number }>(),
      db.prepare("SELECT COUNT(*) AS count FROM clubs WHERE status = 'active'").first<{ count: number }>(),
      db.prepare("SELECT COUNT(*) AS count FROM club_requests WHERE status = 'pending'").first<{ count: number }>(),
      db.prepare('SELECT COUNT(*) AS count FROM club_requests WHERE interest_count >= 7').first<{ count: number }>(),
    ])

  return {
    totalUsers: usersCount?.count ?? 0,
    activeClubs: activeClubsCount?.count ?? 0,
    pendingRequests: pendingRequestsCount?.count ?? 0,
    thresholdReachedRequests: thresholdReachedCount?.count ?? 0,
  }
}

export async function getLeaderboard(limit = 5) {
  const db = getTomDb()
  const result = await db
    .prepare(
      `SELECT u.id, u.full_name, u.role, u.account_status, u.club_count,
              COALESCE(SUM(x.amount), 0) AS xp_total
       FROM users u
       LEFT JOIN xp_logs x ON x.user_id = u.id
       GROUP BY u.id
       ORDER BY xp_total DESC, u.club_count DESC, u.full_name ASC
       LIMIT ?`
    )
    .bind(limit)
    .all<{
      id: string
      full_name: string
      role: ManagedUser['role']
      account_status: ManagedUser['accountStatus']
      club_count: number
      xp_total: number
    }>()

  return result.results.map((row) => ({
    id: row.id,
    name: row.full_name,
    role: row.role,
    accountStatus: row.account_status,
    clubCount: row.club_count,
    points: row.xp_total,
  }))
}

type EventRow = {
  id: string
  title: string
  description: string
  location: string
  event_date: string
  start_time: string
  end_time: string
  status: EventStatus
  created_by: string
  participant_count: number
  created_at: string
  updated_at: string
}

function mapEventRow(row: EventRow): SchoolEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    location: row.location,
    eventDate: row.event_date,
    startTime: row.start_time,
    endTime: row.end_time,
    status: row.status,
    createdBy: row.created_by,
    participantCount: row.participant_count ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function normalizeEvent(input: EventInput, current?: SchoolEvent): SchoolEvent {
  const now = nowIso()

  return {
    id: current?.id ?? crypto.randomUUID(),
    title: input.title,
    description: input.description ?? current?.description ?? '',
    location: input.location ?? current?.location ?? '',
    eventDate: input.eventDate,
    startTime: input.startTime ?? current?.startTime ?? '',
    endTime: input.endTime ?? current?.endTime ?? '',
    status: input.status ?? current?.status ?? 'upcoming',
    createdBy: input.createdBy ?? current?.createdBy ?? 'admin',
    participantCount: current?.participantCount ?? 0,
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
  }
}

export async function listEvents(params: {
  status?: string | null
  createdBy?: string | null
  q?: string | null
} = {}) {
  const db = getTomDb()
  const filters: string[] = []
  const bindings: Array<string | number> = []

  if (params.status) {
    filters.push('e.status = ?')
    bindings.push(params.status)
  }

  if (params.createdBy) {
    filters.push('e.created_by = ?')
    bindings.push(params.createdBy)
  }

  if (params.q) {
    filters.push('(e.title LIKE ? OR e.description LIKE ? OR e.location LIKE ?)')
    bindings.push(`%${params.q}%`, `%${params.q}%`, `%${params.q}%`)
  }

  const where = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : ''
  const result = await db
    .prepare(
      `SELECT e.*, COUNT(ep.id) AS participant_count
       FROM events e
       LEFT JOIN event_participants ep ON ep.event_id = e.id
       ${where}
       GROUP BY e.id
       ORDER BY e.event_date ASC, e.created_at DESC`
    )
    .bind(...bindings)
    .all<EventRow>()

  return result.results.map(mapEventRow)
}

export async function getEvent(id: string) {
  const db = getTomDb()
  const row = await db
    .prepare(
      `SELECT e.*, COUNT(ep.id) AS participant_count
       FROM events e
       LEFT JOIN event_participants ep ON ep.event_id = e.id
       WHERE e.id = ?
       GROUP BY e.id
       LIMIT 1`
    )
    .bind(id)
    .first<EventRow>()

  return row ? mapEventRow(row) : null
}

export async function listEventsForUser(
  userId: string,
  params: {
    status?: string | null
  } = {}
) {
  const db = getTomDb()
  const filters = ['ep.user_id = ?']
  const bindings: Array<string | number> = [userId]

  if (params.status) {
    filters.push('e.status = ?')
    bindings.push(params.status)
  }

  const where = `WHERE ${filters.join(' AND ')}`
  const result = await db
    .prepare(
      `SELECT e.*, COUNT(all_ep.id) AS participant_count
       FROM event_participants ep
       JOIN events e ON e.id = ep.event_id
       LEFT JOIN event_participants all_ep ON all_ep.event_id = e.id
       ${where}
       GROUP BY e.id
       ORDER BY e.event_date ASC, e.start_time ASC, e.created_at DESC`
    )
    .bind(...bindings)
    .all<EventRow>()

  return result.results.map(mapEventRow)
}

export async function upsertEvent(input: EventInput, id?: string) {
  const db = getTomDb()
  const current = id ? await getEvent(id) : null
  const event = normalizeEvent(input, current ?? undefined)

  await db
    .prepare(
      `INSERT INTO events (id, title, description, location, event_date, start_time, end_time, status, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         description = excluded.description,
         location = excluded.location,
         event_date = excluded.event_date,
         start_time = excluded.start_time,
         end_time = excluded.end_time,
         status = excluded.status,
         created_by = excluded.created_by,
         updated_at = excluded.updated_at`
    )
    .bind(
      event.id,
      event.title,
      event.description,
      event.location,
      event.eventDate,
      event.startTime,
      event.endTime,
      event.status,
      event.createdBy,
      event.createdAt,
      event.updatedAt
    )
    .run()

  return event
}

export async function deleteEvent(id: string) {
  const db = getTomDb()
  const current = await getEvent(id)
  if (!current) return false

  await db.prepare('DELETE FROM events WHERE id = ?').bind(id).run()
  return true
}

export async function getEventParticipants(eventId: string) {
  const db = getTomDb()
  const result = await db
    .prepare(
      `SELECT u.id, u.full_name, u.email, u.role, ep.joined_at
       FROM event_participants ep
       JOIN users u ON u.id = ep.user_id
       WHERE ep.event_id = ?
       ORDER BY ep.joined_at ASC`
    )
    .bind(eventId)
    .all<{ id: string; full_name: string; email: string; role: string; joined_at: string }>()

  return result.results.map((row) => ({
    id: row.id,
    name: row.full_name,
    email: row.email,
    role: row.role,
    joinedAt: row.joined_at,
  }))
}

export async function joinEvent(eventId: string, userId: string) {
  const db = getTomDb()
  const now = nowIso()

  await db
    .prepare(
      `INSERT OR IGNORE INTO event_participants (id, event_id, user_id, joined_at)
       VALUES (lower(hex(randomblob(16))), ?, ?, ?)`
    )
    .bind(eventId, userId, now)
    .run()
}

export async function isUserJoinedEvent(eventId: string, userId: string) {
  const db = getTomDb()
  const row = await db
    .prepare('SELECT id FROM event_participants WHERE event_id = ? AND user_id = ? LIMIT 1')
    .bind(eventId, userId)
    .first<{ id: string }>()

  return Boolean(row?.id)
}

export async function leaveEvent(eventId: string, userId: string) {
  const db = getTomDb()
  await db
    .prepare('DELETE FROM event_participants WHERE event_id = ? AND user_id = ?')
    .bind(eventId, userId)
    .run()
}

export async function autoJoinAllUsers(eventId: string) {
  const db = getTomDb()
  const now = nowIso()

  await db
    .prepare(
      `INSERT OR IGNORE INTO event_participants (id, event_id, user_id, joined_at)
       SELECT lower(hex(randomblob(16))), ?, id, ?
       FROM users`
    )
    .bind(eventId, now)
    .run()
}

type EventPostRow = {
  id: string
  event_id: string
  title: string
  body: string
  author_id: string
  author_name: string
  author_role: UserRole
  created_at: string
  updated_at: string
  like_count: number
  liked_by_me: number
}

type EventPostCommentRow = {
  id: string
  post_id: string
  body: string
  author_id: string
  author_name: string
  author_role: UserRole
  created_at: string
  updated_at: string
}

function mapPublicUser(params: { id: string; name: string; role: UserRole }): PublicUser {
  return {
    id: params.id,
    name: params.name,
    role: params.role,
  }
}

function mapEventPostRow(row: EventPostRow): EventPost {
  return {
    id: row.id,
    eventId: row.event_id,
    title: row.title,
    body: row.body,
    author: mapPublicUser({
      id: row.author_id,
      name: row.author_name,
      role: row.author_role,
    }),
    likeCount: row.like_count ?? 0,
    likedByMe: Boolean(row.liked_by_me),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapEventPostCommentRow(row: EventPostCommentRow): EventPostComment {
  return {
    id: row.id,
    postId: row.post_id,
    body: row.body,
    author: mapPublicUser({
      id: row.author_id,
      name: row.author_name,
      role: row.author_role,
    }),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function listEventPosts(
  eventId: string,
  currentUserId?: string | null
): Promise<EventPost[]> {
  const db = getTomDb()
  const viewerId = currentUserId ?? ''

  const result = await db
    .prepare(
      `SELECT
         p.id,
         p.event_id,
         p.title,
         p.body,
         p.author_id,
         u.full_name AS author_name,
         u.role AS author_role,
         p.created_at,
         p.updated_at,
         COUNT(l.id) AS like_count,
         MAX(CASE WHEN l.user_id = ? THEN 1 ELSE 0 END) AS liked_by_me
       FROM event_posts p
       JOIN users u ON u.id = p.author_id
       LEFT JOIN event_post_likes l ON l.post_id = p.id
       WHERE p.event_id = ?
       GROUP BY p.id
       ORDER BY p.created_at DESC`
    )
    .bind(viewerId, eventId)
    .all<EventPostRow>()

  return result.results.map(mapEventPostRow)
}

export async function getEventPost(postId: string): Promise<EventPost | null> {
  const db = getTomDb()

  const row = await db
    .prepare(
      `SELECT
         p.id,
         p.event_id,
         p.title,
         p.body,
         p.author_id,
         u.full_name AS author_name,
         u.role AS author_role,
         p.created_at,
         p.updated_at,
         COUNT(l.id) AS like_count,
         0 AS liked_by_me
       FROM event_posts p
       JOIN users u ON u.id = p.author_id
       LEFT JOIN event_post_likes l ON l.post_id = p.id
       WHERE p.id = ?
       GROUP BY p.id
       LIMIT 1`
    )
    .bind(postId)
    .first<EventPostRow>()

  return row ? mapEventPostRow(row) : null
}

export async function createEventPost(params: {
  eventId: string
  authorId: string
  title?: string | null
  body: string
}): Promise<EventPost | null> {
  const db = getTomDb()
  const now = nowIso()
  const id = crypto.randomUUID()

  await db
    .prepare(
      `INSERT INTO event_posts (id, event_id, author_id, title, body, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(id, params.eventId, params.authorId, params.title ?? '', params.body, now, now)
    .run()

  const row = await db
    .prepare(
      `SELECT
         p.id,
         p.event_id,
         p.title,
         p.body,
         p.author_id,
         u.full_name AS author_name,
         u.role AS author_role,
         p.created_at,
         p.updated_at,
         0 AS like_count,
         0 AS liked_by_me
       FROM event_posts p
       JOIN users u ON u.id = p.author_id
       WHERE p.id = ?
       LIMIT 1`
    )
    .bind(id)
    .first<EventPostRow>()

  return row ? mapEventPostRow(row) : null
}

export async function listEventPostCommentsByPostIds(
  postIds: string[]
): Promise<EventPostComment[]> {
  const db = getTomDb()
  if (postIds.length === 0) return []

  const placeholders = postIds.map(() => '?').join(', ')
  const result = await db
    .prepare(
      `SELECT
         c.id,
         c.post_id,
         c.body,
         c.author_id,
         u.full_name AS author_name,
         u.role AS author_role,
         c.created_at,
         c.updated_at
       FROM event_post_comments c
       JOIN users u ON u.id = c.author_id
       WHERE c.post_id IN (${placeholders})
       ORDER BY c.created_at ASC`
    )
    .bind(...postIds)
    .all<EventPostCommentRow>()

  return result.results.map(mapEventPostCommentRow)
}

export async function createEventPostComment(params: {
  postId: string
  authorId: string
  body: string
}): Promise<EventPostComment | null> {
  const db = getTomDb()
  const now = nowIso()
  const id = crypto.randomUUID()

  await db
    .prepare(
      `INSERT INTO event_post_comments (id, post_id, author_id, body, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(id, params.postId, params.authorId, params.body, now, now)
    .run()

  const row = await db
    .prepare(
      `SELECT
         c.id,
         c.post_id,
         c.body,
         c.author_id,
         u.full_name AS author_name,
         u.role AS author_role,
         c.created_at,
         c.updated_at
       FROM event_post_comments c
       JOIN users u ON u.id = c.author_id
       WHERE c.id = ?
       LIMIT 1`
    )
    .bind(id)
    .first<EventPostCommentRow>()

  return row ? mapEventPostCommentRow(row) : null
}

export async function toggleEventPostLike(params: {
  postId: string
  userId: string
}): Promise<{ likeCount: number; likedByMe: boolean } | null> {
  const db = getTomDb()
  const now = nowIso()

  const existing = await db
    .prepare(
      `SELECT id
       FROM event_post_likes
       WHERE post_id = ?
         AND user_id = ?
       LIMIT 1`
    )
    .bind(params.postId, params.userId)
    .first<{ id: string }>()

  if (existing?.id) {
    await db.prepare('DELETE FROM event_post_likes WHERE id = ?').bind(existing.id).run()

    const countRow = await db
      .prepare(
        `SELECT COUNT(*) as count
         FROM event_post_likes
         WHERE post_id = ?`
      )
      .bind(params.postId)
      .first<{ count: number }>()

    return { likeCount: countRow?.count ?? 0, likedByMe: false }
  }

  await db
    .prepare(
      `INSERT INTO event_post_likes (id, post_id, user_id, created_at)
       VALUES (?, ?, ?, ?)`
    )
    .bind(crypto.randomUUID(), params.postId, params.userId, now)
    .run()

  const countRow = await db
    .prepare(
      `SELECT COUNT(*) as count
       FROM event_post_likes
       WHERE post_id = ?`
    )
    .bind(params.postId)
    .first<{ count: number }>()

  return { likeCount: countRow?.count ?? 0, likedByMe: true }
}

type BadgeRow = {
  id: string
  name: string
  description: string
  icon: string
  xp_threshold: number
  event_count_threshold: number
  club_count_threshold: number
  created_at: string
  updated_at: string
}

function mapBadgeRow(row: BadgeRow): Badge {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    icon: row.icon,
    xpThreshold: row.xp_threshold,
    eventCountThreshold: row.event_count_threshold,
    clubCountThreshold: row.club_count_threshold,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function listBadges(): Promise<Badge[]> {
  const db = getTomDb()
  const result = await db.prepare('SELECT * FROM badges ORDER BY name ASC').all<BadgeRow>()
  return result.results.map(mapBadgeRow)
}

export async function getBadge(id: string): Promise<Badge | null> {
  const db = getTomDb()
  const row = await db.prepare('SELECT * FROM badges WHERE id = ? LIMIT 1').bind(id).first<BadgeRow>()
  return row ? mapBadgeRow(row) : null
}

export async function upsertBadge(input: BadgeInput, id?: string): Promise<Badge> {
  const db = getTomDb()
  const now = nowIso()
  const current = id ? await getBadge(id) : null
  const badge: Badge = {
    id: current?.id ?? crypto.randomUUID(),
    name: input.name,
    description: input.description ?? current?.description ?? '',
    icon: input.icon ?? current?.icon ?? '🏅',
    xpThreshold: input.xpThreshold ?? current?.xpThreshold ?? 0,
    eventCountThreshold: input.eventCountThreshold ?? current?.eventCountThreshold ?? 0,
    clubCountThreshold: input.clubCountThreshold ?? current?.clubCountThreshold ?? 0,
    createdAt: current?.createdAt ?? now,
    updatedAt: now,
  }

  await db
    .prepare(
      `INSERT INTO badges (id, name, description, icon, xp_threshold, event_count_threshold, club_count_threshold, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         description = excluded.description,
         icon = excluded.icon,
         xp_threshold = excluded.xp_threshold,
         event_count_threshold = excluded.event_count_threshold,
         club_count_threshold = excluded.club_count_threshold,
         updated_at = excluded.updated_at`
    )
    .bind(badge.id, badge.name, badge.description, badge.icon, badge.xpThreshold, badge.eventCountThreshold, badge.clubCountThreshold, badge.createdAt, badge.updatedAt)
    .run()

  return badge
}

export async function deleteBadge(id: string): Promise<boolean> {
  const db = getTomDb()
  const current = await getBadge(id)
  if (!current) return false
  await db.prepare('DELETE FROM badges WHERE id = ?').bind(id).run()
  return true
}

export async function checkAndAwardBadges(userId: string): Promise<UserBadge[]> {
  const db = getTomDb()
  const [badges, xpTotal, eventCount, clubCount] = await Promise.all([
    listBadges(),
    getUserXpTotal(userId),
    db.prepare('SELECT COUNT(*) as count FROM event_participants WHERE user_id = ?').bind(userId).first<{ count: number }>().then(r => r?.count ?? 0),
    db.prepare('SELECT club_count FROM users WHERE id = ? LIMIT 1').bind(userId).first<{ club_count: number }>().then(r => r?.club_count ?? 0),
  ])

  const awarded: UserBadge[] = []
  const now = nowIso()

  for (const badge of badges) {
    const qualifies =
      (badge.xpThreshold === 0 || xpTotal >= badge.xpThreshold) &&
      (badge.eventCountThreshold === 0 || eventCount >= badge.eventCountThreshold) &&
      (badge.clubCountThreshold === 0 || clubCount >= badge.clubCountThreshold)

    if (!qualifies) continue

    const existing = await db
      .prepare('SELECT id FROM user_badges WHERE user_id = ? AND badge_id = ? LIMIT 1')
      .bind(userId, badge.id)
      .first<{ id: string }>()

    if (existing) continue

    const id = crypto.randomUUID()
    await db
      .prepare('INSERT INTO user_badges (id, user_id, badge_id, awarded_at) VALUES (?, ?, ?, ?)')
      .bind(id, userId, badge.id, now)
      .run()

    awarded.push({ id, userId, badgeId: badge.id, awardedAt: now })
  }

  return awarded
}

export async function listUserBadges(userId: string): Promise<Array<UserBadge & { badge: Badge }>> {
  const db = getTomDb()
  const result = await db
    .prepare(
      `SELECT ub.id,
              ub.user_id,
              ub.badge_id,
              ub.awarded_at,
              b.id AS b_id,
              b.name AS b_name,
              b.description AS b_description,
              b.icon AS b_icon,
              b.xp_threshold AS b_xp_threshold,
              b.event_count_threshold AS b_event_count_threshold,
              b.club_count_threshold AS b_club_count_threshold,
              b.created_at AS b_created_at,
              b.updated_at AS b_updated_at
       FROM user_badges ub
       JOIN badges b ON b.id = ub.badge_id
       WHERE ub.user_id = ?
       ORDER BY ub.awarded_at DESC`
    )
    .bind(userId)
    .all<{
      id: string
      user_id: string
      badge_id: string
      awarded_at: string
      b_id: string
      b_name: string
      b_description: string
      b_icon: string
      b_xp_threshold: number
      b_event_count_threshold: number
      b_club_count_threshold: number
      b_created_at: string
      b_updated_at: string
    }>()

  return result.results.map((row) => ({
    id: row.id,
    userId: row.user_id,
    badgeId: row.badge_id,
    awardedAt: row.awarded_at,
    badge: {
      id: row.b_id,
      name: row.b_name,
      description: row.b_description,
      icon: row.b_icon,
      xpThreshold: row.b_xp_threshold,
      eventCountThreshold: row.b_event_count_threshold,
      clubCountThreshold: row.b_club_count_threshold,
      createdAt: row.b_created_at,
      updatedAt: row.b_updated_at,
    },
  }))
}

export async function grantXp(userId: string, amount: number, reason: string, source: XpSource): Promise<XpLog> {
  const db = getTomDb()
  const id = crypto.randomUUID()
  const now = nowIso()

  await db
    .prepare('INSERT INTO xp_logs (id, user_id, amount, reason, source, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(id, userId, amount, reason, source, now)
    .run()

  return { id, userId, amount, reason, source, createdAt: now }
}

export async function getUserXpTotal(userId: string): Promise<number> {
  const db = getTomDb()
  const row = await db
    .prepare('SELECT COALESCE(SUM(amount), 0) AS total FROM xp_logs WHERE user_id = ?')
    .bind(userId)
    .first<{ total: number }>()

  return row?.total ?? 0
}

export async function listXpLogs(userId?: string): Promise<XpLog[]> {
  const db = getTomDb()
  const where = userId ? 'WHERE user_id = ?' : ''
  const bindings = userId ? [userId] : []

  const result = await db
    .prepare(`SELECT * FROM xp_logs ${where} ORDER BY created_at DESC LIMIT 100`)
    .bind(...bindings)
    .all<{ id: string; user_id: string; amount: number; reason: string; source: XpSource; created_at: string }>()

  return result.results.map((row) => ({
    id: row.id,
    userId: row.user_id,
    amount: row.amount,
    reason: row.reason,
    source: row.source,
    createdAt: row.created_at,
  }))
}

export async function getXpConfig(): Promise<Record<string, string>> {
  const db = getTomDb()
  const result = await db
    .prepare('SELECT key, value FROM xp_config')
    .all<{ key: string; value: string }>()

  return Object.fromEntries(result.results.map((row) => [row.key, row.value]))
}

export async function setXpConfig(key: string, value: string): Promise<void> {
  const db = getTomDb()
  const now = nowIso()

  await db
    .prepare('INSERT INTO xp_config (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at')
    .bind(key, value, now)
    .run()
}

export async function seedTomDatabase({ reset = false }: { reset?: boolean } = {}) {
  const db = getTomDb()

  if (reset) {
    await db.prepare('DELETE FROM club_memberships').run()
    await db.prepare('DELETE FROM clubs').run()
    await db.prepare('DELETE FROM club_requests').run()
    await db.prepare('DELETE FROM users').run()
  }

  for (const request of seedClubRequests) {
    await upsertClubRequest({
      clubName: request.clubName,
      teacherName: request.teacher,
      createdBy: request.createdBy,
      interestCount: request.interestCount,
      studentLimit: request.studentLimit,
      gradeRange: request.gradeRange,
      allowedDays: request.allowedDays,
      startDate: request.startDate,
      endDate: request.endDate,
      note: request.note,
      requestStatus: request.requestStatus,
      clubStatus: request.clubStatus,
      flaggedReason: request.flaggedReason,
    }, request.id)
  }

  for (const club of seedActiveClubs) {
    await upsertClub({
      name: club.clubName,
      teacherName: club.teacher,
      createdBy: club.createdBy,
      interestCount: club.interestCount,
      studentLimit: club.studentLimit,
      memberCount: 0,
      gradeRange: club.gradeRange,
      allowedDays: club.allowedDays,
      startDate: club.startDate,
      endDate: club.endDate,
      note: club.note,
      description: club.note,
      status: club.clubStatus,
      category: 'general',
      verified: false,
    }, club.id)
  }

  for (const user of seedManagedUsers) {
    await upsertUser({
      name: user.name,
      email: user.email,
      role: user.role,
      teacherProfileName: user.teacherProfileName,
      accountStatus: user.accountStatus,
      reason: user.reason,
      lastActive: user.lastActive,
      clubCount: user.clubCount,
      notes: user.notes,
    }, user.id)
  }

  return {
    ok: true,
    clubs: seedActiveClubs.length,
    requests: seedClubRequests.length,
    users: seedManagedUsers.length,
  }
}

export async function ensureTomUsersSeeded() {
  const db = getTomDb()
  const countRow = await db.prepare('SELECT COUNT(*) AS count FROM users').first<{ count: number }>()
  const count = countRow?.count ?? 0

  if (count === 0) {
    for (const user of seedManagedUsers) {
      await upsertUser({
        name: user.name,
        email: user.email,
        role: user.role,
        teacherProfileName: user.teacherProfileName,
        accountStatus: user.accountStatus,
        reason: user.reason,
        lastActive: user.lastActive,
        clubCount: user.clubCount,
        notes: user.notes,
      }, user.id)
    }
    return { seeded: true }
  }

  return { seeded: false }
}

type AnnouncementRow = {
  id: string
  type: string
  title: string
  content: string
  created_by: string
  club_id: string | null
  event_id: string | null
  created_at: string
}

function mapAnnouncementRow(row: AnnouncementRow): Announcement {
  return {
    id: row.id,
    type: row.type as AnnouncementType,
    title: row.title,
    content: row.content,
    createdBy: row.created_by,
    clubId: row.club_id,
    eventId: row.event_id,
    createdAt: row.created_at,
  }
}

export async function listAnnouncements(type?: string): Promise<Announcement[]> {
  const db = getTomDb()
  const rows = type
    ? await db
        .prepare('SELECT * FROM announcements WHERE type = ? ORDER BY created_at DESC')
        .bind(type)
        .all<AnnouncementRow>()
    : await db
        .prepare('SELECT * FROM announcements ORDER BY created_at DESC')
        .all<AnnouncementRow>()
  return rows.results.map(mapAnnouncementRow)
}

export async function createAnnouncement(
  input: AnnouncementInput,
  createdBy: string
): Promise<Announcement> {
  const db = getTomDb()
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  await db
    .prepare(
      'INSERT INTO announcements (id, type, title, content, created_by, club_id, event_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )
    .bind(id, input.type, input.title, input.content, createdBy, input.clubId ?? null, input.eventId ?? null, now)
    .run()
  return {
    id,
    type: input.type,
    title: input.title,
    content: input.content,
    createdBy,
    clubId: input.clubId ?? null,
    eventId: input.eventId ?? null,
    createdAt: now,
  }
}
