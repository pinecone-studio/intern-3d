import { gql } from '@apollo/client'

export const GET_ROOM_DETAIL = gql`
  query GetRoomDetail($roomId: ID!) {
    room(roomId: $roomId) {
      room { id number floor type status currentEvent { id roomId title type startTime endTime dayOfWeek daysOfWeek date isOverride instructor notes validFrom validUntil } nextEvent { id roomId title type startTime endTime dayOfWeek daysOfWeek date isOverride instructor notes validFrom validUntil } devices { id name roomId roomNumber status assignedTo } }
      events { id roomId title type startTime endTime dayOfWeek daysOfWeek date isOverride instructor notes validFrom validUntil }
    }
  }
`

export const CREATE_SCHEDULE_EVENT = gql`
  mutation CreateScheduleEvent($input: ScheduleEventInput!) { createScheduleEvent(input: $input) { room { id } } }
`

export const UPDATE_SCHEDULE_EVENT = gql`
  mutation UpdateScheduleEvent($id: ID!, $input: ScheduleEventInput!) { updateScheduleEvent(id: $id, input: $input) { room { id } } }
`
