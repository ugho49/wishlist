# API (`apps/api`)

[Znight](https://znight-org.github.io/znight/) backend with Domain-Driven Design. GraphQL is the public API; REST is only for file uploads and health.

Znight resolves dependency injection **at build time**: the compiler (`@znight/compiler`) scans `src/`, binds every constructor parameter to a provider and writes `src/.znight/container.generated.ts` (git-ignored, never edited by hand). Wiring errors are `ZNIGHTxxx` diagnostics with a location. Decorators are markers (no-ops at runtime): no `reflect-metadata`, no `emitDecoratorMetadata`.

## API surface (GraphQL-first)

**GraphQL** (`@znight/graphql`, schema-first) at `POST /graphql`. Domain traffic (auth, users, events, wishlists, items, secret santa, admin, health) goes through GraphQL.

REST is **only** kept for multipart/form-data (GraphQL here is JSON-only) and a health check:

| Method | Path                             | Why REST                                                        |
| ------ | -------------------------------- | --------------------------------------------------------------- |
| `GET`  | `/health`                        | Database ping, 503 when down (also GraphQL `health`)            |
| `POST` | `/user/upload-picture`           | User avatar (`file` field)                                      |
| `POST` | `/admin/user/:id/upload-picture` | Admin avatar (`file` field)                                     |
| `POST` | `/wishlist`                      | Create wishlist with optional logo (`data` JSON + `image` file) |
| `POST` | `/wishlist/:id/upload-logo`      | Wishlist logo (`file` field)                                    |

Do **not** add new REST endpoints unless the operation requires a file upload. Swagger (`/swagger`, `@znight/openapi`) only documents the remaining REST.

## Architecture

- **DDD** — application, domain, and infrastructure layers
- **Flat DI** — no modules: every `@Injectable()` class of `src/` is a provider. An interface with one implementation is injected without token (`constructor(private readonly eventRepository: EventRepository)` binds `PostgresEventRepository`)
- **Use cases** — `@Injectable()` classes (`@znight/core`) with `execute(input)`; resolvers inject them directly (no `CommandBus` / `QueryBus`)
- **`EventPublisher`** (`@znight/events`) — domain events and side effects (emails, etc.); listeners are `@OnEvent({ detached: true })` methods
- **GraphQL** — schema-first `.graphql` files, codegen types, Zod input validation, `BatchLoad` loaders for relations
- **Config** — `@Config` classes (`@znight/config`) read from the environment (Bun loads `.env`): `CoreConfig`, `DatabaseConfig`, `AuthConfig`, `QueueConfig`, `UserConfig`, `MailConfig`, `BucketConfig`. A missing or invalid value fails the boot with `ZNIGHT006`
- **Core** — database (Drizzle), mail (react-email + Nodemailer, provider chosen by `MailFactory`), bucket (Firebase, `BucketFactory`), queues (BullMQ on Valkey), health, GraphQL
- **Domains** — auth (JWT + Google OAuth), user, event, attendee, wishlist, item, secret-santa
- **Database** — PostgreSQL + Drizzle, branded UUIDs
- **Transactions** — `TransactionManager`

Reference domain: `src/event/`.

### Bootstrap

- `src/app.ts` — `createPlugins()`: the plugins shared by `main.ts` and the integration tests (`ConfigPlugin`, `ObservabilityPlugin`, `EventsPlugin`, `HttpPlugin` with the guards and exception mappers, `GraphQLPlugin` with the result mappers, `OpenApiPlugin`)
- `src/main.ts` — `createApplication({ plugins: createPlugins() })` from the generated module, then `app.start()` (SIGINT / SIGTERM stop it gracefully)
- `znight.config.ts` — compiler options (GraphQL schema-first: `schema: 'src/**/*.graphql'`), read by the Bun preload and `znight generate`
- Generation: the Bun preload `@znight/compiler/bun` (`serve`, `test:int`) or `bun nx run api:generate` (`znight generate`, also run by `typecheck`). The Docker image generates at build time

### Auth

- `AuthenticationGuard` (global HTTP guard) reads the bearer token (`TokenService`, `jose`) and stores the user or the token error in the request state; it never denies
- Route decisions of the required `access` group (`createRouteDecorator`): `@Public()`, `@Authenticated()`, `@IsAdmin()`. Every REST route and GraphQL root field must take one (`ZNIGHT023` at build time). Put `@Authenticated()` (or `@IsAdmin()`) on the resolver / controller class, `@Public()` on the open methods
- `AccessGuard` enforces them on routes and root fields (default deny); a missing or invalid token is an `UnauthorizedRejection`
- `@CurrentUser()` / `@CurrentUserId()` param decorators work on REST routes and GraphQL fields

## GraphQL conventions

### Schema

- Schema-first: `{domain}.graphql` under `src/{domain}/infrastructure/`
- Shared scalars, pagination, rejections: `src/core/graphql/base.graphql`
- Operations return **result unions** (success + rejection types), not thrown GraphQL errors for expected failures
- Fields resolved via DataLoaders / field resolvers must be marked `@resolved`. Codegen strips those fields from generated parent types (`codegen-schema-transform.ts`) so mappers do not populate them

After schema changes: `nx run api:codegen` (from the repo root). Output: `src/gql/generated-types.ts` and `schema.graphql`.

### Errors

Result mappers (`src/core/graphql/rejection.mapper.ts`, Znight "errors as data") map the errors of a root field (guards, `@Args` validation, resolver) onto the rejection member of its result union (`data.<field>.__typename`). GraphQL still returns **HTTP 200**. A rejection the union does not declare falls back to `InternalErrorRejection`; an error of a nested field resolver stays in `errors[]`.

| Exception                                 | `__typename`             |
| ----------------------------------------- | ------------------------ |
| `@Args` schema failure (`BAD_USER_INPUT`) | `ValidationRejection`    |
| `BusinessRuleException`                   | `BusinessRuleRejection`  |
| `UnauthorizedException`                   | `UnauthorizedRejection`  |
| `NotFoundException`                       | `NotFoundRejection`      |
| `ForbiddenException`                      | `ForbiddenRejection`     |
| other `HttpException` / unexpected        | `InternalErrorRejection` |

### Validation

- GraphQL inputs: Zod schemas in `{domain}.schema.ts`, passed to `@Args('input', Schema)` (the resolver receives the schema output)
- Remaining REST multipart bodies: `@Body(Schema)` (Zod) on the text fields, `@UploadedFile('file', { maxSize })` for the files (Web `File`); `ImageResizer.resize` checks the picture's magic numbers (never the declared media type) before re-encoding it to WebP. `UploadExceptionMapper` keeps the 400 + French messages and the `message: string[]` validation body

### Resolvers, mappers, loaders

- Query / mutation resolvers inject use cases (or loaders for by-id reads)
- Field resolvers load relations with `@Loader() users: Loader<UsersById>` (one DataLoader per operation)
- Mappers convert domain models to GraphQL types: `eventMapper.toGqlEvent(...)`
- Loaders are `BatchLoad` providers in `{domain}.dataloader.ts`; those that depend on the current user are `@Injectable({ scope: 'request' })` and read it from the `HttpContext`
- Resolver decorators come from `@znight/graphql` (`@Resolver`, `@Query`, `@Mutation`, `@ResolveField`, `@Parent`, `@Args`, `@Ctx`, `@Loader`); `@Resolver('Event')` binds the field resolvers of a type

## Database

- **Studio**: `bun nx run api:drizzle:studio`
- **Generate**: `bun nx run api:drizzle:generate --name <migration-name>`
- **Migrate**: `bun nx run api:drizzle:migrate`
- **Seed**: `bun nx run api:drizzle:seed`
- **Schema**: `drizzle/schema/` (barrel: `drizzle/schema/index.ts`)
- **Migrations**: `drizzle/migrations/`
- **Enums**: domain TypeScript string enums in `src/{domain}/domain/` → Postgres via `tsEnumToPgEnum()` from `drizzle/enum.ts`. Drizzle schemas import the domain enum file directly. The frontend uses GraphQL-generated enums, not domain enums.
- **ORM**: Drizzle only (no TypeORM)
- **Junction tables**: many-to-many (event_wishlist, attendee_exclusion)
- **Audit fields**: `createdAt` / `updatedAt` with timezone handling

## Running

- `bun serve:api` — API (`bun --watch` with the Znight preload)
- `bun serve:api:with-codegen` — API + GraphQL codegen in watch mode

## Unit tests

Business logic branches (every `throw`, guard clause, conditional, early return in `execute()`) belong in **unit tests**. Integration tests cover wiring: auth guards, Zod `@Args` validation, GraphQL round-trips, and database state. Do not re-test use-case branches in int-specs.

**A new use case is not done until it has a colocated unit spec.** Add `{name}.use-case.spec.ts` next to `{name}.use-case.ts` in the same PR. Cover every authorization check, business-rule `throw`, and happy path in `execute()`.

**Use-case specs** (`*.use-case.spec.ts`) live next to the use case:

```
src/item/application/command/toggle-item.use-case.ts
src/item/application/command/toggle-item.use-case.spec.ts
```

- `bun:test`, use `it()` (not `test()`), nested `describe` blocks
- Instantiate the use case in `beforeEach` (no `Test.createTestingModule`)
- Mock dependencies with `createMock<T>()` from `test-utils/mocks`
- Reset with `mock.clearAllMocks()` in `beforeEach`
- Default happy-path `mockResolvedValue` in `beforeEach`; error cases override with `mockResolvedValueOnce`
- Real domain models via builders; mock only repositories / `EventPublisher` / infrastructure
- Logs stay quiet: `test-utils/logger-setup.ts` (preloaded) sets a silent fallback logger for `getLogger()`

```typescript
describe('ToggleItemUseCase', () => {
  const itemRepository = createMock<WishlistItemRepository>();
  const wishlistRepository = createMock<WishlistRepository>();
  const userRepository = createMock<UserRepository>();

  let useCase: ToggleItemUseCase;
  let owner: User;
  let item: WishlistItem;

  beforeEach(() => {
    mock.clearAllMocks();
    owner = new UserBuilder().withEmail('owner@test.fr').build();
    const wishlist = new WishlistBuilder().withOwner(owner).build();
    item = new WishlistItemBuilder().withWishlistId(wishlist.id).build();

    itemRepository.findByIdOrFail.mockResolvedValue(item);
    wishlistRepository.hasAccess.mockResolvedValue(true);
    wishlistRepository.findByIdOrFail.mockResolvedValue(wishlist);
    userRepository.findByIdOrFail.mockResolvedValue(owner);

    useCase = new ToggleItemUseCase(itemRepository, wishlistRepository, userRepository);
  });

  it('should reject when the user has no access to the wishlist', async () => {
    wishlistRepository.hasAccess.mockResolvedValueOnce(false);

    await expect(useCase.execute({ currentUser: toCurrentUser(owner), itemId: item.id })).rejects.toThrow(
      UnauthorizedException,
    );
    expect(itemRepository.save).not.toHaveBeenCalled();
  });
});
```

**Builders** (`test-utils/builders/`) — fluent `with*()` / `as*()` methods, `build()` creates the domain model (`Model.create()` when possible). Keep auto-generated fields (`id`, `createdAt`, `updatedAt`) inside `build()`, not on the builder API. Convert a `User` to `ICurrentUser` with `toCurrentUser(user)`.

**Examples**
- `src/item/application/command/toggle-item.use-case.spec.ts`
- `src/item/application/command/delete-item.use-case.spec.ts`
- `src/event/application/command/add-attendee.use-case.spec.ts`

## Integration tests

Most int-specs target GraphQL resolvers (`*.resolver.int-spec.ts`). A few REST controller specs remain for multipart routes and `GET /health`.

- **Unit tests**: `bun nx run api:test`
- **Int tests**: `bun nx run api:test:int` (need docker to be up, auto create containers at start). `useTestApp()` boots the application with `TestApp` (`@znight/testing`) on a free port
- **Utilities**: `test-utils/` (`createMock`, builders for unit tests; `useTestApp` / fixtures for int tests)
- **No parallel files**: disabled for stability with shared resources
- **Auth**: `getRequest({ signedAs })` logs in via the GraphQL `login` mutation

### Principles

1. **Structure** — `.int-spec.ts` suffix. GraphQL: group by operation (`Query events`, `Mutation createEvent`). REST (uploads only): group by method and path. Always test unauthenticated requests first. `beforeEach` to reset fixtures.
2. **Utilities**

   ```typescript
   import { useTestApp } from '@wishlist/api-test-utils'

   const { getRequest, getFixtures, expectTable } = useTestApp()
   ```

   `getRequest({ signedAs: 'BASE_USER' | 'ADMIN_USER' | 'SUPERADMIN_USER' })` authenticates via GraphQL `login`.
3. **GraphQL** — HTTP 200 even for resolver-level rejections. Assert `__typename` (and still verify the database for mutations).
4. **Validation** — GraphQL failures are `ValidationRejection`, not HTTP 400 (invalid variables answer HTTP 200 with `errors[]`). Use `it.each`. REST multipart: HTTP 400 with `message: string[]`, JSON via `.field('data', JSON.stringify(payload))`.
5. **Database** — every create/update/delete **must** use `expectTable`.
6. **Permissions** — prefer **404 / `NotFoundRejection`** over 403 when the resource must stay hidden.
7. **REST multipart** — the guards run before the body is read, so an unauthenticated upload answers 401 whatever the body:

   ```typescript
   await request.post('/user/upload-picture').field('file', 'not-a-file').expect(401)
   ```
8. **Fixtures** — `fixtures.insertX()`, branded IDs, `DateTime.now().plus({ days: 1 })` / `.minus({ days: 1 })`.

### GraphQL pattern

```typescript
const GRAPHQL_PATH = '/graphql';

describe('Mutation createEvent', () => {
  const mutation = /* GraphQL */ `
    mutation CreateEvent($input: CreateEventInput!) {
      createEvent(input: $input) {
        __typename
        ... on Event { id title }
        ... on ValidationRejection { errors { field message } }
        ... on UnauthorizedRejection { message }
      }
    }
  `;

  it('should not succeed when not authenticated', async () => {
    const request = await getRequest();
    const res = await request
      .post(GRAPHQL_PATH)
      .send({ query: mutation, variables: { input: { title: 'My Event', eventDate: futureDate() } } })
      .expect(200);

    expect(res.body.data?.createEvent?.__typename).not.toBe('Event');
    await expectTable(Fixtures.EVENT_TABLE).hasNumberOfRows(0);
  });
});
```

### Checklist

- [ ] Unauthenticated case first (GraphQL: not the success `__typename`; REST: 401)
- [ ] Dynamic validation with `it.each`
- [ ] `expectTable` for all mutations
- [ ] Permission tests
- [ ] Response / `__typename` validation
- [ ] Non-existent resources
- [ ] Cascades where applicable
- [ ] Fixtures usage and cleanup

### Examples

- GraphQL: `src/event/infrastructure/resolvers/event-mutation.resolver.int-spec.ts`
- GraphQL: `src/user/infrastructure/resolvers/user.resolver.int-spec.ts`
- REST multipart: `src/wishlist/infrastructure/controllers/wishlist.controller.int-spec.ts`
- REST upload 401: `src/user/infrastructure/controllers/user.controller.int-spec.ts`

## Use-case implementation

No Command/Query classes and no `CommandBus`/`QueryBus`. Define `*Input` / `*Output` next to the use case.

### Folder layout

```
src/{domain-name}/
├── domain/
│   ├── event/            # Domain events (plain classes)
│   ├── model/
│   └── repository/       # Interfaces
├── application/
│   ├── command/
│   ├── event/            # Event listeners (@OnEvent({ detached: true }))
│   └── query/
└── infrastructure/
    ├── resolvers/
    ├── controllers/      # Only if a remaining REST upload lives here
    ├── {domain}.graphql
    ├── {domain}.schema.ts
    ├── {domain}.mapper.ts
    ├── {domain}.dataloader.ts
    └── repository/
```

### Naming

- Use case: `{Action}{EntityName}UseCase` — `{kebab-case-action}-{kebab-case-entity}.use-case.ts`
- Input / output: `{Action}{EntityName}Input` / `{Action}{EntityName}Output`
- Event: `{EntityName}{PastTenseAction}Event` — listener class `{EntityName}{PastTenseAction}Handler` with an `@OnEvent({ detached: true }) handle(event)` method
- GraphQL: `{domain}.graphql`, `{domain}.schema.ts`, `{domain}.mapper.ts` (`toGql*` methods)
- Resolvers: `{entity}.resolver.ts`, `{entity}-mutation.resolver.ts`, `{entity}-admin.resolver.ts`, `{entity}.field-resolver.ts`

### Command use case

```typescript
@Injectable()
export class CreateEventUseCase {
  constructor(
    private readonly eventRepository: EventRepository, // the interface: bound to its single implementation
    private readonly eventBus: EventPublisher, // only if a domain event is published
  ) {}

  async execute(input: CreateEventInput): Promise<CreateEventOutput> {
    const event = Event.create({
      id: this.eventRepository.newId(),
      title: input.newEvent.title,
      description: input.newEvent.description,
      eventDate: input.newEvent.eventDate,
      attendees: [],
    });
    await this.eventRepository.save(event);
    return { event };
  }
}
```

### Mutation resolver

```typescript
@Mutation()
async createEvent(
  @Args('input', CreateEventInputSchema) input: CreateEventInput,
  @CurrentUser() currentUser: ICurrentUser,
): Promise<CreateEventResult> {
  const { event } = await this.createEventUseCase.execute({
    currentUser,
    newEvent: {
      title: input.title,
      description: input.description ?? undefined,
      eventDate: new Date(input.eventDate),
    },
  })
  return eventMapper.toGqlEvent(event)
}
```

REST controllers (uploads only) inject the same use cases and use the same `@CurrentUser()` / `@CurrentUserId()`.

Nothing to register: `@Injectable()` classes, resolvers, controllers and `@OnEvent` listeners are discovered by the compiler.

### Rules

1. **Security** — always pass `currentUser` (or `currentUserId`) on user-scoped use cases. Authorization in domain models (`canBeViewedBy`, `canBeModifiedBy`). Return 404 / `NotFoundRejection` instead of 403.
2. **Types** — branded IDs, input/output next to the use case, readonly domain props. GraphQL parents must not include `@resolved` fields.
3. **Transactions** — `TransactionManager.runInTransaction` only for multiple SQL queries. Pass tx context when needed.
4. **Events** — `await this.eventBus.publish(...)` (`EventPublisher`) after successful commands; use for emails and other side effects.
5. **Errors** — domain / `@znight/http` exceptions (`BusinessRuleException`, `NotFoundException`). Validate GraphQL input with Zod on `@Args` in resolvers, not inside every use case.
6. **Tests** — every new use case **must** ship with a colocated `*.use-case.spec.ts` covering its branches. Integration tests cover GraphQL wiring, not those branches. See the unit-test section above.

### Logging

`private readonly logger = getLogger(MyClass.name)` (`@znight/observability`): `info`, `warn`, `error`, `debug` with a message and an object of fields (`this.logger.error('Fail to send mail', { error })`). Request entries carry `requestId`, `ip` and `currentUser`; `/health` is not logged.

### Dependency injection

- Inject repositories by their interface (`private readonly eventRepository: EventRepository`): no token, no `@Inject`
- A dependency cycle is a build error (`ZNIGHT002`): break it with `Lazy<T>` (see `MailService`)
- Several implementations of a type (bucket, mail provider) are chosen by a `@Factory()` with `@Provides()` methods
