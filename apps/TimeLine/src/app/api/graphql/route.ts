import { NextResponse } from 'next/server'
import { buildSchema, graphql } from 'graphql'
import { getRoomDetail, listRooms, listScheduleEvents } from '@/lib/timeline-rest'

const schema = buildSchema(`
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
`)

type QueryArgs = {
  floor?: number | null
  status?: string | null
  search?: string | null
  roomId?: string | null
  dayOfWeek?: number | null
  instructor?: string | null
}

const root = {
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
}

type GraphQLRequestBody = {
  query?: string
  variables?: Record<string, unknown>
  operationName?: string
}

export async function POST(request: Request) {
  let payload: GraphQLRequestBody

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
    rootValue: root,
    variableValues: payload.variables,
    operationName: payload.operationName,
  })

  return NextResponse.json({
    data: result.data ?? null,
    errors: result.errors?.map((error) => ({ message: error.message })),
  })
}
