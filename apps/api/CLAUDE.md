# API (`apps/api`)

NestJS backend with Domain-Driven Design. GraphQL is the public API; REST is only for file uploads and health.

## API surface (GraphQL-first)

**GraphQL** (Yoga + `@nestjs/graphql`) at `POST /graphql`. Domain traffic (auth, users, events, wishlists, items, secret santa, admin, health) goes through GraphQL.

REST is **only** kept for multipart/form-data (GraphQL here is JSON-only) and a health check:

| Method | Path | Why REST |
| --- | --- | --- |
| `GET` | `/health` | Nest Terminus (also GraphQL `health`) |
| `POST` | `/user/upload-picture` | User avatar (`file` field) |
| `POST` | `/admin/user/:id/upload-picture` | Admin avatar (`file` field) |
| `POST` | `/wishlist` | Create wishlist with optional logo (`data` JSON + `image` file) |
| `POST` | `/wishlist/:id/upload-logo` | Wishlist logo (`file` field) |

Do **not** add new REST endpoints unless the operation requires a file upload. Swagger (`/swagger`) only documents the remaining REST.

## Architecture

- **DDD** — application, domain, and infrastructure layers
- **Use cases** — Nest `Injectable` classes with `execute(input)`; resolvers inject them directly (no `CommandBus` / `QueryBus`)
- **`EventBus`** (`@nestjs/cqrs`) — domain events and side effects (emails, etc.)
- **GraphQL** — schema-first `.graphql` files, codegen types, Zod input validation, DataLoaders for relations
- **Core modules** — database (Drizzle), mail (react-email + Nodemailer), bucket (Firebase), health, GraphQL
- **Domain modules** — auth (JWT + Google OAuth), user, event, attendee, wishlist, item, secret-santa
- **Database** — PostgreSQL + Drizzle, branded UUIDs
- **Transactions** — `TransactionManager`

Reference domain: `src/event/`.

## GraphQL conventions

### Schema
- Schema-first: `{domain}.graphql` under `src/{domain}/infrastructure/`
- Shared scalars, pagination, rejections: `src/core/graphql/base.graphql`
- Operations return **result unions** (success + rejection types), not thrown GraphQL errors for expected failures
- Fields resolved via DataLoaders / field resolvers must be marked `@resolved`. Codegen strips those fields from generated parent types (`codegen-schema-transform.ts`) so mappers do not populate them

After schema changes: `nx run api:codegen` (from the repo root). Output: `src/gql/generated-types.ts` and `schema.graphql`.

### Errors
Yoga plugin `useErrorTransformPlugin` maps thrown Nest exceptions onto the field as a typed rejection (`data.<field>.__typename`). GraphQL still returns **HTTP 200**.

| Exception | `__typename` |
| --- | --- |
| `ZodValidationException` | `ValidationRejection` |
| `BusinessRuleException` | `BusinessRuleRejection` |
| `UnauthorizedException` | `UnauthorizedRejection` |
| `NotFoundException` | `NotFoundRejection` |
| `ForbiddenException` | `ForbiddenRejection` |
| other `HttpException` / unexpected | `InternalErrorRejection` |

### Validation
- GraphQL inputs: Zod schemas in `{domain}.schema.ts` + `ZodPipe` on `@Args`
- Remaining REST multipart bodies: `class-validator` DTOs in `@wishlist/common` (e.g. `CreateWishlistHttpRequest`)

### Resolvers, mappers, loaders
- Query / mutation resolvers inject use cases (or loaders for by-id reads)
- Field resolvers load relations from `ctx.loaders`
- Mappers convert domain models to GraphQL types: `eventMapper.toGqlEvent(...)`
- DataLoader factories live next to the domain and are registered on `DataLoaderService`

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
- `bun serve:api` — NestJS API
- `bun serve:api:with-codegen` — API + GraphQL codegen in watch mode

## Integration tests

Most int-specs target GraphQL resolvers (`*.resolver.int-spec.ts`). A few REST controller specs remain for multipart routes and `GET /health`.

- **Unit tests**: `bun nx run api:test`
- **Int tests**: `bun nx run api:test:int` (need docker to be up, auto create containers at start)
- **Utilities**: `test-utils/`
- **No parallel files**: disabled for stability with shared resources
- **Auth**: `getRequest({ signedAs })` logs in via the GraphQL `login` mutation

### Principles

1. **Structure** — `.int-spec.ts` suffix. GraphQL: group by operation (`Query events`, `Mutation createEvent`). REST (uploads only): group by method and path. Always test unauthenticated requests first. `beforeEach` to reset fixtures.
2. **Utilities**
   ```typescript
   import { useTestApp } from '@wishlist/api-test-utils'

   const { getRequest, getFixtures, expectTable } = useTestApp()
   ```
   `getRequest({ signedAs: 'BASE_USER' | 'ADMIN_USER' })` authenticates via GraphQL `login`.
3. **GraphQL** — HTTP 200 even for resolver-level rejections. Assert `__typename` (and still verify the database for mutations).
4. **Validation** — GraphQL failures are `ValidationRejection`, not HTTP 400. Use `it.each`. REST multipart: HTTP 400 + `class-validator`, JSON via `.field('data', JSON.stringify(payload))`.
5. **Database** — every create/update/delete **must** use `expectTable`.
6. **Permissions** — prefer **404 / `NotFoundRejection`** over 403 when the resource must stay hidden.
7. **REST multipart on Bun** — `FileInterceptor` + an empty POST hangs up the socket (`socket hang up`) before AuthGuard can return 401. Unauthenticated upload tests must send a dummy multipart field:
   ```typescript
   await request.post('/user/upload-picture').field('file', 'not-a-file').expect(401)
   ```
8. **Fixtures** — `fixtures.insertX()`, branded IDs, `DateTime.now().plus({ days: 1 })` / `.minus({ days: 1 })`.

### GraphQL pattern

```typescript
const GRAPHQL_PATH = '/graphql'

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
  `

  it('should not succeed when not authenticated', async () => {
    const request = await getRequest()
    const res = await request
      .post(GRAPHQL_PATH)
      .send({ query: mutation, variables: { input: { title: 'My Event', eventDate: futureDate() } } })
      .expect(200)

    expect(res.body.data?.createEvent?.__typename).not.toBe('Event')
    await expectTable(Fixtures.EVENT_TABLE).hasNumberOfRows(0)
  })
})
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
│   ├── event/            # EventBus handlers (@EventsHandler)
│   ├── query/
│   └── index.ts          # `handlers` array on the Nest module
└── infrastructure/
    ├── resolvers/
    ├── controllers/      # Only if a remaining REST upload lives here
    ├── {domain}.graphql
    ├── {domain}.schema.ts
    ├── {domain}.mapper.ts
    ├── {domain}.dataloader.ts
    ├── repository/
    └── {domain}.module.ts
```

### Naming
- Use case: `{Action}{EntityName}UseCase` — `{kebab-case-action}-{kebab-case-entity}.use-case.ts`
- Input / output: `{Action}{EntityName}Input` / `{Action}{EntityName}Output`
- Event: `{EntityName}{PastTenseAction}Event` — handler `{EntityName}{PastTenseAction}Handler` with `@EventsHandler`
- GraphQL: `{domain}.graphql`, `{domain}.schema.ts`, `{domain}.mapper.ts` (`toGql*` methods)
- Resolvers: `{entity}.resolver.ts`, `{entity}-mutation.resolver.ts`, `{entity}-admin.resolver.ts`, `{entity}.field-resolver.ts`

### Command use case

```typescript
@Injectable()
export class CreateEventUseCase {
  constructor(
    @Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository,
    private readonly eventBus: EventBus, // only if a domain event is published
  ) {}

  async execute(input: CreateEventInput): Promise<CreateEventOutput> {
    const event = Event.create({
      id: this.eventRepository.newId(),
      title: input.newEvent.title,
      description: input.newEvent.description,
      eventDate: input.newEvent.eventDate,
      attendees: [],
    })
    await this.eventRepository.save(event)
    return { event }
  }
}
```

### Mutation resolver

```typescript
@Mutation()
async createEvent(
  @Args('input', new ZodPipe(CreateEventInputSchema)) input: CreateEventInput,
  @GqlCurrentUser() currentUser: ICurrentUser,
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

REST controllers (uploads only) inject the same use cases and use `@CurrentUser()` (HTTP), not `@GqlCurrentUser()`.

Register new command/query/event-handler classes in `application/index.ts` `handlers`.

### Rules
1. **Security** — always pass `currentUser` (or `currentUserId`) on user-scoped use cases. Authorization in domain models (`canBeViewedBy`, `canBeModifiedBy`). Return 404 / `NotFoundRejection` instead of 403.
2. **Types** — branded IDs, input/output next to the use case, readonly domain props. GraphQL parents must not include `@resolved` fields.
3. **Transactions** — `TransactionManager.runInTransaction` only for multiple SQL queries. Pass tx context when needed.
4. **Events** — publish after successful commands via `EventBus`; use for emails and other side effects.
5. **Errors** — domain / Nest exceptions (`BusinessRuleException`, `NotFoundException`). Validate GraphQL input with Zod + `ZodPipe` in resolvers, not inside every use case.
6. **Tests** — follow the integration guidelines above.

### Repository tokens

`REPOSITORIES` from `src/repositories/repositories.constants.ts`:

```typescript
@Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository
```
