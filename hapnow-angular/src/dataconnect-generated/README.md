# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `Angular README`, you can find it at [`dataconnect-generated/angular/README.md`](./angular/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetMeetingById*](#getmeetingbyid)
  - [*ListUpcomingMeetings*](#listupcomingmeetings)
- [**Mutations**](#mutations)
  - [*CreateNewUser*](#createnewuser)
  - [*UpdateActionItemStatus*](#updateactionitemstatus)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetMeetingById
You can execute the `GetMeetingById` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getMeetingById(vars: GetMeetingByIdVariables): QueryPromise<GetMeetingByIdData, GetMeetingByIdVariables>;

interface GetMeetingByIdRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetMeetingByIdVariables): QueryRef<GetMeetingByIdData, GetMeetingByIdVariables>;
}
export const getMeetingByIdRef: GetMeetingByIdRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMeetingById(dc: DataConnect, vars: GetMeetingByIdVariables): QueryPromise<GetMeetingByIdData, GetMeetingByIdVariables>;

interface GetMeetingByIdRef {
  ...
  (dc: DataConnect, vars: GetMeetingByIdVariables): QueryRef<GetMeetingByIdData, GetMeetingByIdVariables>;
}
export const getMeetingByIdRef: GetMeetingByIdRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMeetingByIdRef:
```typescript
const name = getMeetingByIdRef.operationName;
console.log(name);
```

### Variables
The `GetMeetingById` query requires an argument of type `GetMeetingByIdVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetMeetingByIdVariables {
  meetingId: UUIDString;
}
```
### Return Type
Recall that executing the `GetMeetingById` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMeetingByIdData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetMeetingById`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMeetingById, GetMeetingByIdVariables } from '@dataconnect/generated';

// The `GetMeetingById` query requires an argument of type `GetMeetingByIdVariables`:
const getMeetingByIdVars: GetMeetingByIdVariables = {
  meetingId: ..., 
};

// Call the `getMeetingById()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMeetingById(getMeetingByIdVars);
// Variables can be defined inline as well.
const { data } = await getMeetingById({ meetingId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMeetingById(dataConnect, getMeetingByIdVars);

console.log(data.meeting);

// Or, you can use the `Promise` API.
getMeetingById(getMeetingByIdVars).then((response) => {
  const data = response.data;
  console.log(data.meeting);
});
```

### Using `GetMeetingById`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMeetingByIdRef, GetMeetingByIdVariables } from '@dataconnect/generated';

// The `GetMeetingById` query requires an argument of type `GetMeetingByIdVariables`:
const getMeetingByIdVars: GetMeetingByIdVariables = {
  meetingId: ..., 
};

// Call the `getMeetingByIdRef()` function to get a reference to the query.
const ref = getMeetingByIdRef(getMeetingByIdVars);
// Variables can be defined inline as well.
const ref = getMeetingByIdRef({ meetingId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMeetingByIdRef(dataConnect, getMeetingByIdVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.meeting);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.meeting);
});
```

## ListUpcomingMeetings
You can execute the `ListUpcomingMeetings` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listUpcomingMeetings(): QueryPromise<ListUpcomingMeetingsData, undefined>;

interface ListUpcomingMeetingsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUpcomingMeetingsData, undefined>;
}
export const listUpcomingMeetingsRef: ListUpcomingMeetingsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listUpcomingMeetings(dc: DataConnect): QueryPromise<ListUpcomingMeetingsData, undefined>;

interface ListUpcomingMeetingsRef {
  ...
  (dc: DataConnect): QueryRef<ListUpcomingMeetingsData, undefined>;
}
export const listUpcomingMeetingsRef: ListUpcomingMeetingsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listUpcomingMeetingsRef:
```typescript
const name = listUpcomingMeetingsRef.operationName;
console.log(name);
```

### Variables
The `ListUpcomingMeetings` query has no variables.
### Return Type
Recall that executing the `ListUpcomingMeetings` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListUpcomingMeetingsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListUpcomingMeetings`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listUpcomingMeetings } from '@dataconnect/generated';


// Call the `listUpcomingMeetings()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listUpcomingMeetings();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listUpcomingMeetings(dataConnect);

console.log(data.meetings);

// Or, you can use the `Promise` API.
listUpcomingMeetings().then((response) => {
  const data = response.data;
  console.log(data.meetings);
});
```

### Using `ListUpcomingMeetings`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listUpcomingMeetingsRef } from '@dataconnect/generated';


// Call the `listUpcomingMeetingsRef()` function to get a reference to the query.
const ref = listUpcomingMeetingsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listUpcomingMeetingsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.meetings);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.meetings);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateNewUser
You can execute the `CreateNewUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createNewUser(vars: CreateNewUserVariables): MutationPromise<CreateNewUserData, CreateNewUserVariables>;

interface CreateNewUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateNewUserVariables): MutationRef<CreateNewUserData, CreateNewUserVariables>;
}
export const createNewUserRef: CreateNewUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createNewUser(dc: DataConnect, vars: CreateNewUserVariables): MutationPromise<CreateNewUserData, CreateNewUserVariables>;

interface CreateNewUserRef {
  ...
  (dc: DataConnect, vars: CreateNewUserVariables): MutationRef<CreateNewUserData, CreateNewUserVariables>;
}
export const createNewUserRef: CreateNewUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createNewUserRef:
```typescript
const name = createNewUserRef.operationName;
console.log(name);
```

### Variables
The `CreateNewUser` mutation requires an argument of type `CreateNewUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateNewUserVariables {
  displayName: string;
  email: string;
}
```
### Return Type
Recall that executing the `CreateNewUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateNewUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateNewUserData {
  user_insert: User_Key;
}
```
### Using `CreateNewUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createNewUser, CreateNewUserVariables } from '@dataconnect/generated';

// The `CreateNewUser` mutation requires an argument of type `CreateNewUserVariables`:
const createNewUserVars: CreateNewUserVariables = {
  displayName: ..., 
  email: ..., 
};

// Call the `createNewUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createNewUser(createNewUserVars);
// Variables can be defined inline as well.
const { data } = await createNewUser({ displayName: ..., email: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createNewUser(dataConnect, createNewUserVars);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
createNewUser(createNewUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

### Using `CreateNewUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createNewUserRef, CreateNewUserVariables } from '@dataconnect/generated';

// The `CreateNewUser` mutation requires an argument of type `CreateNewUserVariables`:
const createNewUserVars: CreateNewUserVariables = {
  displayName: ..., 
  email: ..., 
};

// Call the `createNewUserRef()` function to get a reference to the mutation.
const ref = createNewUserRef(createNewUserVars);
// Variables can be defined inline as well.
const ref = createNewUserRef({ displayName: ..., email: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createNewUserRef(dataConnect, createNewUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_insert);
});
```

## UpdateActionItemStatus
You can execute the `UpdateActionItemStatus` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateActionItemStatus(vars: UpdateActionItemStatusVariables): MutationPromise<UpdateActionItemStatusData, UpdateActionItemStatusVariables>;

interface UpdateActionItemStatusRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateActionItemStatusVariables): MutationRef<UpdateActionItemStatusData, UpdateActionItemStatusVariables>;
}
export const updateActionItemStatusRef: UpdateActionItemStatusRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateActionItemStatus(dc: DataConnect, vars: UpdateActionItemStatusVariables): MutationPromise<UpdateActionItemStatusData, UpdateActionItemStatusVariables>;

interface UpdateActionItemStatusRef {
  ...
  (dc: DataConnect, vars: UpdateActionItemStatusVariables): MutationRef<UpdateActionItemStatusData, UpdateActionItemStatusVariables>;
}
export const updateActionItemStatusRef: UpdateActionItemStatusRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateActionItemStatusRef:
```typescript
const name = updateActionItemStatusRef.operationName;
console.log(name);
```

### Variables
The `UpdateActionItemStatus` mutation requires an argument of type `UpdateActionItemStatusVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateActionItemStatusVariables {
  actionItemId: UUIDString;
  status: string;
}
```
### Return Type
Recall that executing the `UpdateActionItemStatus` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateActionItemStatusData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateActionItemStatusData {
  actionItem_update?: ActionItem_Key | null;
}
```
### Using `UpdateActionItemStatus`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateActionItemStatus, UpdateActionItemStatusVariables } from '@dataconnect/generated';

// The `UpdateActionItemStatus` mutation requires an argument of type `UpdateActionItemStatusVariables`:
const updateActionItemStatusVars: UpdateActionItemStatusVariables = {
  actionItemId: ..., 
  status: ..., 
};

// Call the `updateActionItemStatus()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateActionItemStatus(updateActionItemStatusVars);
// Variables can be defined inline as well.
const { data } = await updateActionItemStatus({ actionItemId: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateActionItemStatus(dataConnect, updateActionItemStatusVars);

console.log(data.actionItem_update);

// Or, you can use the `Promise` API.
updateActionItemStatus(updateActionItemStatusVars).then((response) => {
  const data = response.data;
  console.log(data.actionItem_update);
});
```

### Using `UpdateActionItemStatus`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateActionItemStatusRef, UpdateActionItemStatusVariables } from '@dataconnect/generated';

// The `UpdateActionItemStatus` mutation requires an argument of type `UpdateActionItemStatusVariables`:
const updateActionItemStatusVars: UpdateActionItemStatusVariables = {
  actionItemId: ..., 
  status: ..., 
};

// Call the `updateActionItemStatusRef()` function to get a reference to the mutation.
const ref = updateActionItemStatusRef(updateActionItemStatusVars);
// Variables can be defined inline as well.
const ref = updateActionItemStatusRef({ actionItemId: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateActionItemStatusRef(dataConnect, updateActionItemStatusVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.actionItem_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.actionItem_update);
});
```

