import { NextResponse } from 'next/server'
import { buildSchema, graphql } from 'graphql'
import { createScheduleEvent, deleteScheduleEvent, getRoomDetail, listRooms, listScheduleEvents, updateScheduleEvent } from '@/lib/timeline-rest'
import { getTimelineSessionUserIdFromRequest } from '@/lib/session'
import type { ScheduleEventInput } from '@/lib/timeline-mutations'

const schema = buildSchema(`
  input ScheduleEventInput {
    roomId: ID!
    title: String!
    type: String!
    startTime: String!
    endTime: String!
    daysOfWeek: [Int!]!
    date: String
    isOverride: Boolean
    instructor: String
    notes: String
    validFrom: String
    validUntil: String
  }

  type Device {
    id: ID!
    name: String!
    roomId: ID!
    roomNumber: String!
    status: String!
    assignedTo: String
  }

  type ScheduleEvent {
    id: ID!
    roomId: ID!
    title: String!
    type: String!
    startTime: String!
    endTime: String!
    dayOfWeek: Int!
    daysOfWeek: [Int!]!
    date: String
    isOverride: Boolean!
    instructor: String
    notes: String
    validFrom: String
    validUntil: String
  }

  type Room {
    id: ID!
    number: String!
    floor: Int!
    type: String!
    status: String!
    currentEvent: ScheduleEvent
    nextEvent: ScheduleEvent
    devices: [Device!]!
  }

  type RoomDetail {
    room: Room!
    events: [ScheduleEvent!]!
  }

  type Query {
    rooms(floor: Int, status: String, search: String): [Room!]!
    events(roomId: ID, dayOfWeek: Int, instructor: String): [ScheduleEvent!]!
    room(roomId: ID!): RoomDetail
  }

  type Mutation {
    createScheduleEvent(input: ScheduleEventInput!): RoomDetail
    updateScheduleEvent(id: ID!, input: ScheduleEventInput!): RoomDetail
    deleteScheduleEvent(id: ID!): Boolean!
  }
`)

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
    schema,
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
