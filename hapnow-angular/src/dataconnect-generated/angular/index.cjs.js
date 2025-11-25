const { createNewUserRef, getMeetingByIdRef, updateActionItemStatusRef, listUpcomingMeetingsRef } = require('../');
const { DataConnect, CallerSdkTypeEnum } = require('@angular/fire/data-connect');
const { injectDataConnectQuery, injectDataConnectMutation } = require('@tanstack-query-firebase/angular/data-connect');
const { inject, EnvironmentInjector } = require('@angular/core');

exports.injectCreateNewUser = function injectCreateNewUser(args, injector) {
  return injectDataConnectMutation(createNewUserRef, args, injector, CallerSdkTypeEnum.GeneratedAngular);
}

exports.injectGetMeetingById = function injectGetMeetingById(args, options, injector) {
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

exports.injectUpdateActionItemStatus = function injectUpdateActionItemStatus(args, injector) {
  return injectDataConnectMutation(updateActionItemStatusRef, args, injector, CallerSdkTypeEnum.GeneratedAngular);
}

exports.injectListUpcomingMeetings = function injectListUpcomingMeetings(options, injector) {
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

