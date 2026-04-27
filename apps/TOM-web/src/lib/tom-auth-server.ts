import 'server-only'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { TOM_SESSION_COOKIE_NAME } from '@/lib/tom-auth'
import { getCurrentUserFromSession } from '@/lib/tom-session'
import type { TomCurrentUser, UserRole } from '@/lib/tom-types'

function routeForRole(role: UserRole) {
  switch (role) {
    case 'admin':
      return '/admin'
    case 'teacher':
      return '/teacher'
    default:
      return '/students'
  }
}

export async function getServerCurrentUser() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get(TOM_SESSION_COOKIE_NAME)?.value
  if (!sessionId) return null

  return getCurrentUserFromSession(sessionId)
}

export async function requireServerUser(allowedRoles?: UserRole[]): Promise<TomCurrentUser> {
  const currentUser = await getServerCurrentUser()

  if (!currentUser) {
    redirect('/')
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    redirect(routeForRole(currentUser.role))
  }

  return currentUser
}
