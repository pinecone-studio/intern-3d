import { NextResponse } from 'next/server'
import { graphql } from 'graphql'
import { createScheduleEvent, deleteScheduleEvent, getRoomDetail, listRooms, listScheduleEvents, updateScheduleEvent } from '@/lib/timeline-rest'
import { timelineGraphqlSchema } from '@/app/api/graphql/schema'
import { getTimelineSessionUserIdFromRequest } from '@/lib/session'
import type { ScheduleEventInput } from '@/lib/timeline-mutations'

type QueryArgs = {
  floor?: number | null
  status?: string | null
  search?: string | null
  roomId?: string | null
  dayOfWeek?: number | null
  instructor?: string | null
}

type MutationArgs = {
  id?: string
  input?: ScheduleEventInput
}

function createRoot(currentUserId: string | null) {
  return {
    rooms: async ({ floor, status, search }: QueryArgs) =>
      listRooms({
        floor: floor != null ? String(floor) : null,
        status: status ?? null,
        search: search ?? null,
      }),
    events: async ({ roomId, dayOfWeek, instructor }: QueryArgs) =>
      listScheduleEvents({
        roomId: roomId ?? null,
        dayOfWeek: dayOfWeek != null ? String(dayOfWeek) : null,
        instructor: instructor ?? null,
      }),
    room: async ({ roomId }: QueryArgs) => {
      if (!roomId) return null
      return getRoomDetail(roomId)
    },
    createScheduleEvent: async ({ input }: MutationArgs) => {
      if (!input) return null
      return createScheduleEvent(input, currentUserId)
    },
    updateScheduleEvent: async ({ id, input }: MutationArgs) => {
      if (!id || !input) return null
      return updateScheduleEvent(id, input, currentUserId)
    },
    deleteScheduleEvent: async ({ id }: MutationArgs) => {
      if (!id) return false
      return deleteScheduleEvent(id, currentUserId)
    },
  }
}

type GraphQLRequestBody = {
  query?: string
  variables?: Record<string, unknown>
  operationName?: string
}

export async function POST(request: Request) {
  let payload: GraphQLRequestBody
  const currentUserId = getTimelineSessionUserIdFromRequest(request)

  try {
    payload = (await request.json()) as GraphQLRequestBody
  } catch {
    return NextResponse.json({ errors: [{ message: 'Invalid JSON body' }] }, { status: 400 })
  }

  if (!payload.query) {
    return NextResponse.json({ errors: [{ message: 'Missing GraphQL query' }] }, { status: 400 })
  }

  const result = await graphql({
    schema: timelineGraphqlSchema,
    source: payload.query,
    rootValue: createRoot(currentUserId),
    variableValues: payload.variables,
    operationName: payload.operationName,
  })

  return NextResponse.json({
    data: result.data ?? null,
    errors: result.errors?.map((error) => ({ message: error.message })),
  })
}
