import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Device = {
  assignedTo?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  roomId: Scalars['ID']['output'];
  roomNumber: Scalars['String']['output'];
  status: Scalars['String']['output'];
};

export type Mutation = {
  createScheduleEvent?: Maybe<RoomDetail>;
  deleteScheduleEvent: Scalars['Boolean']['output'];
  updateScheduleEvent?: Maybe<RoomDetail>;
};


export type MutationCreateScheduleEventArgs = {
  input: ScheduleEventInput;
};


export type MutationDeleteScheduleEventArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateScheduleEventArgs = {
  id: Scalars['ID']['input'];
  input: ScheduleEventInput;
};

export type Query = {
  events: Array<ScheduleEvent>;
  room?: Maybe<RoomDetail>;
  rooms: Array<Room>;
};


export type QueryEventsArgs = {
  dayOfWeek?: InputMaybe<Scalars['Int']['input']>;
  instructor?: InputMaybe<Scalars['String']['input']>;
  roomId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryRoomArgs = {
  roomId: Scalars['ID']['input'];
};


export type QueryRoomsArgs = {
  floor?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};

export type Room = {
  currentEvent?: Maybe<ScheduleEvent>;
  devices: Array<Device>;
  floor: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  nextEvent?: Maybe<ScheduleEvent>;
  number: Scalars['String']['output'];
  status: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type RoomDetail = {
  events: Array<ScheduleEvent>;
  room: Room;
};

export type ScheduleEvent = {
  date?: Maybe<Scalars['String']['output']>;
  dayOfWeek: Scalars['Int']['output'];
  daysOfWeek: Array<Scalars['Int']['output']>;
  endTime: Scalars['String']['output'];
  groupId?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  instructor?: Maybe<Scalars['String']['output']>;
  isOverride: Scalars['Boolean']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  roomId: Scalars['ID']['output'];
  startTime: Scalars['String']['output'];
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
  validFrom?: Maybe<Scalars['String']['output']>;
  validUntil?: Maybe<Scalars['String']['output']>;
};

export type ScheduleEventInput = {
  date?: InputMaybe<Scalars['String']['input']>;
  daysOfWeek: Array<Scalars['Int']['input']>;
  endTime: Scalars['String']['input'];
  groupId?: InputMaybe<Scalars['String']['input']>;
  instructor?: InputMaybe<Scalars['String']['input']>;
  isOverride?: InputMaybe<Scalars['Boolean']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  roomId: Scalars['ID']['input'];
  startTime: Scalars['String']['input'];
  title: Scalars['String']['input'];
  type: Scalars['String']['input'];
  validFrom?: InputMaybe<Scalars['String']['input']>;
  validUntil?: InputMaybe<Scalars['String']['input']>;
};

export type GetRoomDetailQueryVariables = Exact<{
  roomId: Scalars['ID']['input'];
}>;


export type GetRoomDetailQuery = { room?: { room: { id: string, number: string, floor: number, type: string, status: string, currentEvent?: { id: string, roomId: string, title: string, groupId?: string | null, type: string, startTime: string, endTime: string, dayOfWeek: number, daysOfWeek: Array<number>, date?: string | null, isOverride: boolean, instructor?: string | null, notes?: string | null, validFrom?: string | null, validUntil?: string | null } | null, nextEvent?: { id: string, roomId: string, title: string, groupId?: string | null, type: string, startTime: string, endTime: string, dayOfWeek: number, daysOfWeek: Array<number>, date?: string | null, isOverride: boolean, instructor?: string | null, notes?: string | null, validFrom?: string | null, validUntil?: string | null } | null, devices: Array<{ id: string, name: string, roomId: string, roomNumber: string, status: string, assignedTo?: string | null }> }, events: Array<{ id: string, roomId: string, title: string, groupId?: string | null, type: string, startTime: string, endTime: string, dayOfWeek: number, daysOfWeek: Array<number>, date?: string | null, isOverride: boolean, instructor?: string | null, notes?: string | null, validFrom?: string | null, validUntil?: string | null }> } | null };

export type CreateScheduleEventMutationVariables = Exact<{
  input: ScheduleEventInput;
}>;


export type CreateScheduleEventMutation = { createScheduleEvent?: { room: { id: string } } | null };

export type UpdateScheduleEventMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: ScheduleEventInput;
}>;


export type UpdateScheduleEventMutation = { updateScheduleEvent?: { room: { id: string } } | null };

export type DeleteScheduleEventMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteScheduleEventMutation = { deleteScheduleEvent: boolean };

export type GetSchedulerDataQueryVariables = Exact<{
  floor?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetSchedulerDataQuery = { rooms: Array<{ id: string, number: string, floor: number, type: string, status: string, currentEvent?: { id: string, roomId: string, title: string, groupId?: string | null, type: string, startTime: string, endTime: string, dayOfWeek: number, daysOfWeek: Array<number>, date?: string | null, isOverride: boolean, instructor?: string | null, notes?: string | null, validFrom?: string | null, validUntil?: string | null } | null, nextEvent?: { id: string, roomId: string, title: string, groupId?: string | null, type: string, startTime: string, endTime: string, dayOfWeek: number, daysOfWeek: Array<number>, date?: string | null, isOverride: boolean, instructor?: string | null, notes?: string | null, validFrom?: string | null, validUntil?: string | null } | null, devices: Array<{ id: string, name: string, roomId: string, roomNumber: string, status: string, assignedTo?: string | null }> }>, events: Array<{ id: string, roomId: string, title: string, groupId?: string | null, type: string, startTime: string, endTime: string, dayOfWeek: number, daysOfWeek: Array<number>, date?: string | null, isOverride: boolean, instructor?: string | null, notes?: string | null, validFrom?: string | null, validUntil?: string | null }> };


export const GetRoomDetailDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetRoomDetail"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"roomId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"room"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"roomId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"roomId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"room"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"floor"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"currentEvent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"roomId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"groupId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"dayOfWeek"}},{"kind":"Field","name":{"kind":"Name","value":"daysOfWeek"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"isOverride"}},{"kind":"Field","name":{"kind":"Name","value":"instructor"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"validFrom"}},{"kind":"Field","name":{"kind":"Name","value":"validUntil"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nextEvent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"roomId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"groupId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"dayOfWeek"}},{"kind":"Field","name":{"kind":"Name","value":"daysOfWeek"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"isOverride"}},{"kind":"Field","name":{"kind":"Name","value":"instructor"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"validFrom"}},{"kind":"Field","name":{"kind":"Name","value":"validUntil"}}]}},{"kind":"Field","name":{"kind":"Name","value":"devices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"roomId"}},{"kind":"Field","name":{"kind":"Name","value":"roomNumber"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"assignedTo"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"events"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"roomId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"groupId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"dayOfWeek"}},{"kind":"Field","name":{"kind":"Name","value":"daysOfWeek"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"isOverride"}},{"kind":"Field","name":{"kind":"Name","value":"instructor"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"validFrom"}},{"kind":"Field","name":{"kind":"Name","value":"validUntil"}}]}}]}}]}}]} as unknown as DocumentNode<GetRoomDetailQuery, GetRoomDetailQueryVariables>;
export const CreateScheduleEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateScheduleEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ScheduleEventInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createScheduleEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"room"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<CreateScheduleEventMutation, CreateScheduleEventMutationVariables>;
export const UpdateScheduleEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateScheduleEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ScheduleEventInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateScheduleEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"room"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateScheduleEventMutation, UpdateScheduleEventMutationVariables>;
export const DeleteScheduleEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteScheduleEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteScheduleEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteScheduleEventMutation, DeleteScheduleEventMutationVariables>;
export const GetSchedulerDataDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSchedulerData"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"floor"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rooms"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"floor"},"value":{"kind":"Variable","name":{"kind":"Name","value":"floor"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"floor"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"currentEvent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"roomId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"groupId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"dayOfWeek"}},{"kind":"Field","name":{"kind":"Name","value":"daysOfWeek"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"isOverride"}},{"kind":"Field","name":{"kind":"Name","value":"instructor"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"validFrom"}},{"kind":"Field","name":{"kind":"Name","value":"validUntil"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nextEvent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"roomId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"groupId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"dayOfWeek"}},{"kind":"Field","name":{"kind":"Name","value":"daysOfWeek"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"isOverride"}},{"kind":"Field","name":{"kind":"Name","value":"instructor"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"validFrom"}},{"kind":"Field","name":{"kind":"Name","value":"validUntil"}}]}},{"kind":"Field","name":{"kind":"Name","value":"devices"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"roomId"}},{"kind":"Field","name":{"kind":"Name","value":"roomNumber"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"assignedTo"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"events"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"roomId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"groupId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"startTime"}},{"kind":"Field","name":{"kind":"Name","value":"endTime"}},{"kind":"Field","name":{"kind":"Name","value":"dayOfWeek"}},{"kind":"Field","name":{"kind":"Name","value":"daysOfWeek"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"isOverride"}},{"kind":"Field","name":{"kind":"Name","value":"instructor"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"validFrom"}},{"kind":"Field","name":{"kind":"Name","value":"validUntil"}}]}}]}}]} as unknown as DocumentNode<GetSchedulerDataQuery, GetSchedulerDataQueryVariables>;