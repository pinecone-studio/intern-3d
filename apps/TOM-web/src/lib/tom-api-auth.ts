import type { NextRequest } from 'next/server'

import { getCurrentUserFromRequest } from '@/lib/tom-auth'
import { forbidden, unauthorized } from '@/lib/tom-http'
import type { TomCurrentUser, UserRole } from '@/lib/tom-types'

type ApiAuthSuccess = {
  response?: never
  user: TomCurrentUser
}

type ApiAuthFailure = {
  response: Response
  user?: never
}

type ApiAuthResult = ApiAuthSuccess | ApiAuthFailure

export async function requireApiUser(
  request: NextRequest,
  allowedRoles: UserRole[],
  options: { activeOnly?: boolean } = {}
): Promise<ApiAuthResult> {
  const currentUser = await getCurrentUserFromRequest(request, true)

  if (!currentUser) {
    return { response: unauthorized('Session not found.') }
  }

  if (!allowedRoles.includes(currentUser.role)) {
    return { response: forbidden('You do not have permission to perform this action.') }
  }

  if (options.activeOnly && currentUser.accountStatus !== 'active') {
    return { response: forbidden('Your account is not active.') }
  }

  return { user: currentUser }
}

export function requireAdmin(request: NextRequest) {
  return requireApiUser(request, ['admin'], { activeOnly: true })
}

function normalizeOwnerName(value: string) {
  return value.trim().toLocaleLowerCase()
}

export function getTeacherScopeName(user: Pick<TomCurrentUser, 'name' | 'teacherProfileName'>) {
  return (user.teacherProfileName || user.name).trim()
}

export function canManageTeacherOwnedResource(user: TomCurrentUser, ownerName: string) {
  if (user.role === 'admin') return true
  if (user.role !== 'teacher') return false

  return normalizeOwnerName(getTeacherScopeName(user)) === normalizeOwnerName(ownerName)
}
