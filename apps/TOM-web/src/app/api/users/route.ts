import type { NextRequest } from 'next/server'

import { requireAdmin } from '@/lib/tom-api-auth'
import { badRequest, conflict, ok, serverError } from '@/lib/tom-http'
import { ensureTomUsersSeeded, getUserByEmail, listUsers, upsertUser } from '@/lib/tom-db'
import { parseUserInput } from '@/lib/tom-validators'


export async function GET(request: Request) {
  try {
    await ensureTomUsersSeeded()

    const { searchParams } = new URL(request.url)
    const users = await listUsers({
      role: searchParams.get('role'),
      accountStatus: searchParams.get('accountStatus'),
      q: searchParams.get('q'),
    })

    return ok({ users })
  } catch (error) {
    return serverError('Failed to load users.', String(error))
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request)
    if (auth.response) return auth.response

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const input = parseUserInput(body)
    if (!input) return badRequest('User name and email are required.')

    const existing = await getUserByEmail(input.email)
    if (existing) {
      return conflict('A user with this email already exists.')
    }

    const user = await upsertUser(input)
    return ok({ user }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && /UNIQUE constraint failed: users\.email/i.test(error.message)) {
      return conflict('A user with this email already exists.')
    }

    return serverError('Failed to create user.', String(error))
  }
}
