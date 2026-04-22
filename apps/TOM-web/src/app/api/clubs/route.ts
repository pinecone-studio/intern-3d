import { badRequest, ok, serverError } from '@/lib/tom-http'
import { listClubs, upsertClub } from '@/lib/tom-db'
import { parseClubInput } from '@/lib/tom-validators'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const clubs = await listClubs({
      status: searchParams.get('status'),
      teacher: searchParams.get('teacher'),
      q: searchParams.get('q'),
    })

    return ok({ clubs })
  } catch (error) {
    return serverError('Failed to load clubs.', String(error))
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const input = parseClubInput(body)
    if (!input) return badRequest('Club name is required.')

    const club = await upsertClub(input)
    return ok({ club }, { status: 201 })
  } catch (error) {
    return serverError('Failed to create club.', String(error))
  }
}
