import { buildSchema } from 'graphql'

export const timelineGraphqlTypeDefs = `
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
`

export const timelineGraphqlSchema = buildSchema(timelineGraphqlTypeDefs)

export default timelineGraphqlSchema
