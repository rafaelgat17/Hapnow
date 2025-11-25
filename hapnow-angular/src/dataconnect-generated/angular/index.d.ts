import { CreateNewUserData, CreateNewUserVariables, GetMeetingByIdData, GetMeetingByIdVariables, UpdateActionItemStatusData, UpdateActionItemStatusVariables, ListUpcomingMeetingsData } from '../';
import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise} from '@angular/fire/data-connect';
import { CreateQueryResult, CreateMutationResult} from '@tanstack/angular-query-experimental';
import { CreateDataConnectQueryResult, CreateDataConnectQueryOptions, CreateDataConnectMutationResult, DataConnectMutationOptionsUndefinedMutationFn } from '@tanstack-query-firebase/angular/data-connect';
import { FirebaseError } from 'firebase/app';
import { Injector } from '@angular/core';

type CreateNewUserOptions = DataConnectMutationOptionsUndefinedMutationFn<CreateNewUserData, FirebaseError, CreateNewUserVariables>;
export function injectCreateNewUser(options?: CreateNewUserOptions, injector?: Injector): CreateDataConnectMutationResult<CreateNewUserData, CreateNewUserVariables, CreateNewUserVariables>;

type GetMeetingByIdArgs = GetMeetingByIdVariables | (() => GetMeetingByIdVariables);
export type GetMeetingByIdOptions = () => Omit<CreateDataConnectQueryOptions<GetMeetingByIdData, GetMeetingByIdVariables>, 'queryFn'>;
export function injectGetMeetingById(args: GetMeetingByIdArgs, options?: GetMeetingByIdOptions, injector?: Injector): CreateDataConnectQueryResult<GetMeetingByIdData, GetMeetingByIdVariables>;

type UpdateActionItemStatusOptions = DataConnectMutationOptionsUndefinedMutationFn<UpdateActionItemStatusData, FirebaseError, UpdateActionItemStatusVariables>;
export function injectUpdateActionItemStatus(options?: UpdateActionItemStatusOptions, injector?: Injector): CreateDataConnectMutationResult<UpdateActionItemStatusData, UpdateActionItemStatusVariables, UpdateActionItemStatusVariables>;

export type ListUpcomingMeetingsOptions = () => Omit<CreateDataConnectQueryOptions<ListUpcomingMeetingsData, undefined>, 'queryFn'>;
export function injectListUpcomingMeetings(options?: ListUpcomingMeetingsOptions, injector?: Injector): CreateDataConnectQueryResult<ListUpcomingMeetingsData, undefined>;
