import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'hapnow-angular',
  location: 'europe-central2'
};

export const createNewUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewUser', inputVars);
}
createNewUserRef.operationName = 'CreateNewUser';

export function createNewUser(dcOrVars, vars) {
  return executeMutation(createNewUserRef(dcOrVars, vars));
}

export const getMeetingByIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMeetingById', inputVars);
}
getMeetingByIdRef.operationName = 'GetMeetingById';

export function getMeetingById(dcOrVars, vars) {
  return executeQuery(getMeetingByIdRef(dcOrVars, vars));
}

export const updateActionItemStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateActionItemStatus', inputVars);
}
updateActionItemStatusRef.operationName = 'UpdateActionItemStatus';

export function updateActionItemStatus(dcOrVars, vars) {
  return executeMutation(updateActionItemStatusRef(dcOrVars, vars));
}

export const listUpcomingMeetingsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListUpcomingMeetings');
}
listUpcomingMeetingsRef.operationName = 'ListUpcomingMeetings';

export function listUpcomingMeetings(dc) {
  return executeQuery(listUpcomingMeetingsRef(dc));
}

