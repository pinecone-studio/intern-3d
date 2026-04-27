import type { ClubInput, ClubRequestInput, UserInput } from '@/lib/tom-types'

function asString(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function asOptionalString(value: unknown) {
  const str = asString(value)
  return str ? str : undefined
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function asBoolean(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback
}

export function parseClubInput(body: Record<string, unknown>) {
  const name = asString(body.name ?? body.clubName)
  if (!name) return null

  const input: ClubInput = {
    name,
    description: asOptionalString(body.description),
    teacherName: asOptionalString(body.teacherName ?? body.teacher),
    createdBy: asOptionalString(body.createdBy),
    interestCount: asNumber(body.interestCount),
    studentLimit: asNumber(body.studentLimit ?? body.memberLimit, 20),
    memberCount: asNumber(body.memberCount),
    gradeRange: asOptionalString(body.gradeRange),
    allowedDays: asOptionalString(body.allowedDays),
    startDate: asOptionalString(body.startDate),
    endDate: asOptionalString(body.endDate),
    note: asOptionalString(body.note),
    status: asOptionalString(body.status) as ClubInput['status'],
    category: asOptionalString(body.category),
    verified: asBoolean(body.verified),
  }

  return input
}

export function parseClubRequestInput(body: Record<string, unknown>) {
  const clubName = asString(body.clubName ?? body.name)
  if (!clubName) return null

  const input: ClubRequestInput = {
    clubName,
    teacherName: asOptionalString(body.teacherName ?? body.teacher),
    createdBy: asOptionalString(body.createdBy),
    interestCount: asNumber(body.interestCount),
    studentLimit: asNumber(body.studentLimit ?? body.memberLimit, 20),
    gradeRange: asOptionalString(body.gradeRange),
    allowedDays: asOptionalString(body.allowedDays),
    startDate: asOptionalString(body.startDate),
    endDate: asOptionalString(body.endDate),
    note: asOptionalString(body.note),
    requestStatus: asOptionalString(body.requestStatus ?? body.status) as ClubRequestInput['requestStatus'],
    clubStatus: asOptionalString(body.clubStatus) as ClubRequestInput['clubStatus'],
    flaggedReason: asString(body.flaggedReason) || null,
  }

  return input
}

export function parseUserInput(body: Record<string, unknown>) {
  const name = asString(body.name ?? body.fullName)
  const email = asString(body.email)
  if (!name || !email) return null

  const input: UserInput = {
    name,
    email,
    role: asString(body.role) as UserInput['role'],
    accountStatus: asString(body.accountStatus) as UserInput['accountStatus'],
    reason: asString(body.reason),
    lastActive: asString(body.lastActive),
    clubCount: asNumber(body.clubCount),
    notes: asString(body.notes),
  }

  return input
}

export function parseSessionLoginInput(body: Record<string, unknown>) {
  const userId = asString(body.userId)
  if (!userId) return null

  return { userId }
}
