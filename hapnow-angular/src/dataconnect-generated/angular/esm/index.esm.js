import { createNewUserRef, getMeetingByIdRef, updateActionItemStatusRef, listUpcomingMeetingsRef } from '../../';
import { DataConnect, CallerSdkTypeEnum } from '@angular/fire/data-connect';
import { injectDataConnectQuery, injectDataConnectMutation } from '@tanstack-query-firebase/angular/data-connect';
import { inject, EnvironmentInjector } from '@angular/core';
export function injectCreateNewUser(args, injector) {
  return injectDataConnectMutation(createNewUserRef, args, injector, CallerSdkTypeEnum.GeneratedAngular);
}

export function injectGetMeetingById(args, options, injector) {
  const finalInjector = injector || inject(EnvironmentInjector);
  const dc = finalInjector.get(DataConnect);
  const varsFactoryFn = (typeof args === 'function') ? args : () => args;
  return injectDataConnectQuery(() => {
    const addOpn = options && options();
    return {
      queryFn: () =>  getMeetingByIdRef(dc, varsFactoryFn()),
      ...addOpn
    };
  }, finalInjector, CallerSdkTypeEnum.GeneratedAngular);
}

export function injectUpdateActionItemStatus(args, injector) {
  return injectDataConnectMutation(updateActionItemStatusRef, args, injector, CallerSdkTypeEnum.GeneratedAngular);
}

export function injectListUpcomingMeetings(options, injector) {
  const finalInjector = injector || inject(EnvironmentInjector);
  const dc = finalInjector.get(DataConnect);
  return injectDataConnectQuery(() => {
    const addOpn = options && options();
    return {
      queryFn: () =>  listUpcomingMeetingsRef(dc),
      ...addOpn
    };
  }, finalInjector, CallerSdkTypeEnum.GeneratedAngular);
}

