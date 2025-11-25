# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.


### Angular

The generated SDK creates injectable wrapper functions.

Here's an example:
```
import { injectCreateNewUser, injectGetMeetingById, injectUpdateActionItemStatus, injectListUpcomingMeetings } from '@dataconnect/generated/angular';

@Component({
  selector: 'my-component',
  ...
})
class MyComponent {
  // The types of these injectors are available in angular/index.d.ts
  private readonly CreateNewUserOperation = injectCreateNewUser(createNewUserVars);
  private readonly GetMeetingByIdOperation = injectGetMeetingById(getMeetingByIdVars);
  private readonly UpdateActionItemStatusOperation = injectUpdateActionItemStatus(updateActionItemStatusVars);
  private readonly ListUpcomingMeetingsOperation = injectListUpcomingMeetings();
  }
```

Each operation is a wrapper function around Tanstack Query Angular.

Here's an example:
```ts
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'simple-example',
  template: `
    @if (movies.isPending()) {
      Loading...
    }
    @if (movies.error()) {
      An error has occurred: {{ movies.error().message }}
    }
    @if (movies.data(); as data) {
      @for (movie of data.movies ; track
        movie.id) {
      <h1>{{ movie.title }}</h1>
      <p>{{ movie.synopsis }}</p>
      }
    }
  `
})
export class SimpleExampleComponent {
  http = inject(HttpClient)

  movies = injectListMovies();
}
```




## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createNewUser, getMeetingById, updateActionItemStatus, listUpcomingMeetings } from '@dataconnect/generated';


// Operation CreateNewUser:  For variables, look at type CreateNewUserVars in ../index.d.ts
const { data } = await CreateNewUser(dataConnect, createNewUserVars);

// Operation GetMeetingById:  For variables, look at type GetMeetingByIdVars in ../index.d.ts
const { data } = await GetMeetingById(dataConnect, getMeetingByIdVars);

// Operation UpdateActionItemStatus:  For variables, look at type UpdateActionItemStatusVars in ../index.d.ts
const { data } = await UpdateActionItemStatus(dataConnect, updateActionItemStatusVars);

// Operation ListUpcomingMeetings: 
const { data } = await ListUpcomingMeetings(dataConnect);


```