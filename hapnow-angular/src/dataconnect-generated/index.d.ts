import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface ActionItem_Key {
  id: UUIDString;
  __typename?: 'ActionItem_Key';
}

export interface CreateNewUserData {
  user_insert: User_Key;
}

export interface CreateNewUserVariables {
  displayName: string;
  email: string;
}

export interface GetMeetingByIdData {
  meeting?: {
    id: UUIDString;
    title: string;
    description?: string | null;
    startTime: TimestampString;
    endTime: TimestampString;
    location?: string | null;
    organizer?: {
      id: UUIDString;
      displayName: string;
      email: string;
    } & User_Key;
      actionItems_on_meeting: ({
        id: UUIDString;
        description: string;
        dueDate: DateString;
        status: string;
        assignedTo?: {
          id: UUIDString;
          displayName: string;
          email: string;
        } & User_Key;
      } & ActionItem_Key)[];
        notes_on_meeting: ({
          id: UUIDString;
          content: string;
          author?: {
            id: UUIDString;
            displayName: string;
            email: string;
          } & User_Key;
        } & Note_Key)[];
  } & Meeting_Key;
}

export interface GetMeetingByIdVariables {
  meetingId: UUIDString;
}

export interface ListUpcomingMeetingsData {
  meetings: ({
    id: UUIDString;
    title: string;
    startTime: TimestampString;
    endTime: TimestampString;
    location?: string | null;
    organizer?: {
      displayName: string;
    };
  } & Meeting_Key)[];
}

export interface MeetingAttendee_Key {
  meetingId: UUIDString;
  userId: UUIDString;
  __typename?: 'MeetingAttendee_Key';
}

export interface Meeting_Key {
  id: UUIDString;
  __typename?: 'Meeting_Key';
}

export interface Note_Key {
  id: UUIDString;
  __typename?: 'Note_Key';
}

export interface UpdateActionItemStatusData {
  actionItem_update?: ActionItem_Key | null;
}

export interface UpdateActionItemStatusVariables {
  actionItemId: UUIDString;
  status: string;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateNewUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewUserVariables): MutationRef<CreateNewUserData, CreateNewUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateNewUserVariables): MutationRef<CreateNewUserData, CreateNewUserVariables>;
  operationName: string;
}
export const createNewUserRef: CreateNewUserRef;

export function createNewUser(vars: CreateNewUserVariables): MutationPromise<CreateNewUserData, CreateNewUserVariables>;
export function createNewUser(dc: DataConnect, vars: CreateNewUserVariables): MutationPromise<CreateNewUserData, CreateNewUserVariables>;

interface GetMeetingByIdRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetMeetingByIdVariables): QueryRef<GetMeetingByIdData, GetMeetingByIdVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetMeetingByIdVariables): QueryRef<GetMeetingByIdData, GetMeetingByIdVariables>;
  operationName: string;
}
export const getMeetingByIdRef: GetMeetingByIdRef;

export function getMeetingById(vars: GetMeetingByIdVariables): QueryPromise<GetMeetingByIdData, GetMeetingByIdVariables>;
export function getMeetingById(dc: DataConnect, vars: GetMeetingByIdVariables): QueryPromise<GetMeetingByIdData, GetMeetingByIdVariables>;

interface UpdateActionItemStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateActionItemStatusVariables): MutationRef<UpdateActionItemStatusData, UpdateActionItemStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateActionItemStatusVariables): MutationRef<UpdateActionItemStatusData, UpdateActionItemStatusVariables>;
  operationName: string;
}
export const updateActionItemStatusRef: UpdateActionItemStatusRef;

export function updateActionItemStatus(vars: UpdateActionItemStatusVariables): MutationPromise<UpdateActionItemStatusData, UpdateActionItemStatusVariables>;
export function updateActionItemStatus(dc: DataConnect, vars: UpdateActionItemStatusVariables): MutationPromise<UpdateActionItemStatusData, UpdateActionItemStatusVariables>;

interface ListUpcomingMeetingsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUpcomingMeetingsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListUpcomingMeetingsData, undefined>;
  operationName: string;
}
export const listUpcomingMeetingsRef: ListUpcomingMeetingsRef;

export function listUpcomingMeetings(): QueryPromise<ListUpcomingMeetingsData, undefined>;
export function listUpcomingMeetings(dc: DataConnect): QueryPromise<ListUpcomingMeetingsData, undefined>;

