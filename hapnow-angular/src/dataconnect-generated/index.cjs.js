const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'example',
  service: 'hapnow-angular',
  location: 'europe-central2'
};
exports.connectorConfig = connectorConfig;

const createNewUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateNewUser', inputVars);
}
createNewUserRef.operationName = 'CreateNewUser';
exports.createNewUserRef = createNewUserRef;

exports.createNewUser = function createNewUser(dcOrVars, vars) {
  return executeMutation(createNewUserRef(dcOrVars, vars));
};

const getMeetingByIdRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMeetingById', inputVars);
}
getMeetingByIdRef.operationName = 'GetMeetingById';
exports.getMeetingByIdRef = getMeetingByIdRef;

exports.getMeetingById = function getMeetingById(dcOrVars, vars) {
  return executeQuery(getMeetingByIdRef(dcOrVars, vars));
};

const updateActionItemStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateActionItemStatus', inputVars);
}
updateActionItemStatusRef.operationName = 'UpdateActionItemStatus';
exports.updateActionItemStatusRef = updateActionItemStatusRef;

exports.updateActionItemStatus = function updateActionItemStatus(dcOrVars, vars) {
  return executeMutation(updateActionItemStatusRef(dcOrVars, vars));
};

const listUpcomingMeetingsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListUpcomingMeetings');
}
listUpcomingMeetingsRef.operationName = 'ListUpcomingMeetings';
exports.listUpcomingMeetingsRef = listUpcomingMeetingsRef;

exports.listUpcomingMeetings = function listUpcomingMeetings(dc) {
  return executeQuery(listUpcomingMeetingsRef(dc));
};
