# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Building and Running
- `yarn build` - Build all projects in the monorepo
- `yarn serve:front` - Start the React frontend development server (port 4200)
- `yarn serve:api` - Start the NestJS API development server
- `yarn serve:all` - Start all applications concurrently

### Testing
- `yarn test` - Run unit tests for all projects using Vitest
- `yarn test:int` - Run integration tests with Testcontainers and Docker orchestration
- `yarn typecheck` - Run TypeScript type checking across all projects
- Single test execution: Use Nx to run specific tests: `nx test <project-name>`

### Quality Assurance
- `yarn check` - Run Biome check (replaces ESLint)
- `yarn check:fix` - Fix Biome violations automatically
- Pre-commit hooks automatically check and fix code with Biome via lint-staged
- Conventional commits enforced via commitlint

### Database Operations
- **Drizzle Studio**: `nx run api:drizzle:studio` - Open database management UI
- **Generate Migration**: `nx run api:drizzle:generate --name <migration-name>`
- **Run Migrations**: `nx run api:drizzle:migrate`
- **Seed Database**: `nx run api:drizzle:seed` - Populate database with sample data
- **Schema**: Located in `apps/api/drizzle/schema.ts`
- **Migrations**: Stored in `apps/api/drizzle/migrations/`

### Docker Environment
- `yarn docker:up` - Start PostgreSQL, MailDev, and Adminer for development
- `yarn docker:down` - Stop and clean up Docker containers
- Adminer available for database management in local environment

## Architecture Overview

This is an Nx monorepo containing a wishlist application with React frontend and NestJS backend, requiring Node.js 24+.

### Project Structure
- **apps/api/** - NestJS backend with Domain-Driven Design and CQRS
- **apps/front/** - React frontend with Vite, Material-UI, and Redux Toolkit
- **libs/common/** - Shared DTOs, enums, branded types, and interfaces
- **libs/api-client/** - Generated type-safe API client for frontend

### Backend Architecture (NestJS)
- **Domain-Driven Design** with application, domain, and infrastructure layers
- **CQRS pattern** extensively used via `@nestjs/cqrs` (commands, queries, events)
- **Core modules**: database (Drizzle), mail (MJML + Nodemailer), bucket (Firebase), health
- **Domain modules**: auth (JWT + Google OAuth), user, event, attendee, wishlist, item, secret-santa
- **Database**: PostgreSQL with Drizzle ORM using branded UUID types for type safety
- **Transaction management**: Available via TransactionManager service

### Frontend Architecture (React)
- **State Management**: Redux Toolkit for client state, React Query for server state
- **UI Framework**: Material-UI (MUI) with custom theming system
- **Styling**: Prefer `styled()` components over `sx` prop for reusable styles and better performance
- **Routing**: TanStack Router with file-based routing and type-safe navigation
- **Form Handling**: React Hook Form with Zod schema validation
- **Build Tool**: Vite with SWC for fast compilation and SVGR for SVG imports

#### Frontend Styling Guidelines
- **Use `styled()` components** whenever possible instead of `sx` prop for better performance and reusability
- **Reserve `sx` prop** only for one-off styles or rapid prototyping
- **Theme integration**: Always use theme values in `styled()` components via the `theme` parameter
- **Responsive design**: Use theme breakpoints in styled components: `theme.breakpoints.up('md')`
- **Component naming**: Use descriptive names with `Styled` suffix (e.g., `HeaderStyled`, `ContainerWrapper`)

#### MUI Component Usage (IMPORTANT)
- **Be careful with `component` prop** on MUI components in TypeScript - it can cause type errors
- **For Button navigation**: When using `component={Link}`, you may need proper type assertions. **Alternative approach**: Use `onClick={() => navigate('/')}` with `useNavigate()` hook
- **For Typography as lists**: `<Typography component="ul">` may cause type issues, prefer `<Box component="ul">` for semantic HTML
- **Type safety**: Always check TypeScript errors when using `component` prop and consider alternatives if types conflict
- **Navigation best practice**: For simple navigation, `useNavigate()` hook is often more reliable than `component` prop

#### DOM Structure and Component Organization
- **Avoid unnecessary nested containers**: Before creating wrapper divs, ask "Does this container add unique structural, semantic, or styling value?"
- **Problematic pattern to avoid**:
  ```jsx
  <OuterContainer>
    <InnerList>
      {items.map(item => <Item key={item.id} />)}
    </InnerList>
  </OuterContainer>
  ```
  If `OuterContainer` only contains `InnerList`, merge their styles into one component.

- **When nested containers ARE acceptable**:
  - Different semantic purposes (e.g., `<section><ul>` for accessibility)
  - Different animation or positioning requirements
  - Logical separation for component reusability
  - Different state management between parent and child
  - Different responsive behaviors

- **Refactoring approach**: Merge styles into the functional container and eliminate the wrapper-only div.

### Key Domain Concepts
- **Events**: Central organizing concept for wishlist sharing with mandatory event dates
- **Attendees**: Users participating in events with role-based permissions (MAINTAINER/PARTICIPANT)
- **Wishlists**: User-specific collections linked to events
- **Items**: Wishlist entries with web scraping metadata and reservation system
- **Secret Santa**: Complex feature with exclusion rules, budget constraints, and automated draw logic

### Testing Architecture
- **Unit Tests**: Vitest with 20s timeout, configured workspace-wide
- **Integration Tests**: Testcontainers with Docker Compose orchestration for real database testing
- **Test Utilities**: Comprehensive fixtures and assertions in `apps/api/src/test-utils/`
- **No Parallel Files**: Disabled for test stability with shared resources

### Database Schema Patterns
- **Branded Types**: EventId, UserId, AttendeeId etc. for compile-time type safety
- **Migration Strategy**: Currently migrating from TypeORM to Drizzle (both entity definitions present)
- **Junction Tables**: Many-to-many relationships (event_wishlist, attendee_exclusion)
- **Audit Fields**: createdAt/updatedAt with automatic timezone handling

### Development Workflow

- **Monorepo**: Nx with proper build dependencies and caching
- **Code Quality**: Biome (replaces ESLint and Prettier) with security rules and import sorting
- **Git Hooks**: Husky for pre-commit formatting and conventional commit validation
- **Package Manager**: Yarn

## Integration Testing Guidelines

### Core Testing Principles
When writing integration tests for controllers, follow these mandatory rules:

#### 1. Test Structure and Organization
- **File naming**: Use `.int-spec.ts` suffix for integration tests
- **Test organization**: Group tests by HTTP method (GET, POST, PUT, DELETE)
- **Nested describe blocks**: Use authentication state as primary grouping within each method
- **Authentication tests**: Always test unauthenticated requests first (expect 401)
- **Test isolation**: Use `beforeEach` to reset fixtures and request instances

#### 2. Required Test Utilities
```typescript
// Always import these from useTestApp (import { useTestApp } from '@wishlist/api-test-utils')
const { getRequest, getFixtures, expectTable } = useTestApp()
```

#### 3. Authentication Testing Pattern
```typescript
describe('POST /resource', () => {
  it('should return unauthorized if not authenticated', async () => {
    const request = await getRequest()
    await request.post(path).send(validData).expect(401)
  })

  describe('when user is authenticated', () => {
    let request: RequestApp
    let currentUserId: string

    beforeEach(async () => {
      request = await getRequest({ signedAs: 'BASE_USER' })
      currentUserId = await fixtures.getSignedUserId('BASE_USER')
    })
    // ... authenticated tests
  })
})
```

#### 4. Dynamic Validation Testing
Use `it.each` for testing multiple validation scenarios:
```typescript
it.each([
  {
    body: {},
    case: 'empty body',
    message: ['field must not be empty', 'field must be a string'],
  },
  {
    body: { field: 'invalid' },
    case: 'invalid field',
    message: ['field must be a valid enum value'],
  },
])('should return 400 when invalid input: $case', async ({ body, message }) => {
  await request
    .post(path)
    .send(body)
    .expect(400)
    .expect(({ body }) =>
      expect(body).toMatchObject({ 
        error: 'Bad Request', 
        message: expect.arrayContaining(message) 
      })
    )
})
```

#### 5. Database Verification (MANDATORY)
Every test that creates, updates, or deletes data MUST verify the database state:
```typescript
// For creation tests
const response = await request.post(path).send(data).expect(201)
const createdId = response.body.id

await expectTable(Fixtures.TABLE_NAME)
  .hasNumberOfRows(1)
  .row(0)
  .toMatchObject({
    id: createdId,
    field: 'expected_value',
    created_at: expect.toBeDate(),
    updated_at: expect.toBeDate(),
  })

// For update tests
await request.put(path(id)).send(updateData).expect(200)

await expectTable(Fixtures.TABLE_NAME)
  .hasNumberOfRows(1)
  .row(0)
  .toMatchObject({
    id: id,
    field: 'updated_value',
    updated_at: expect.toBeDate(),
  })

// For deletion tests
await request.delete(path(id)).expect(200)
await expectTable(Fixtures.TABLE_NAME).hasNumberOfRows(0)
```

#### 6. Permission Testing
Always test authorization scenarios:
```typescript
it('should return 404 when user is not maintainer/owner', async () => {
  const otherUserId = await fixtures.insertUser({
    email: 'other@test.com',
    firstname: 'Other',
    lastname: 'User',
  })

  const { resourceId } = await fixtures.insertResourceWithOwner({
    ownerId: otherUserId,
    // ... other fields
  })

  await request.method(path(resourceId)).send(data).expect(404)
  
  // Verify no changes were made
  await expectTable(Fixtures.TABLE_NAME).hasNumberOfRows(1)
})
```

#### 7. Response Validation
Always validate response structure:
```typescript
.expect(({ body }) => {
  expect(body).toEqual({
    id: expect.toBeString(),
    field: 'expected_value',
    created_at: expect.toBeDateString(),
    updated_at: expect.toBeDateString(),
  })
})
```

#### 8. Edge Cases and Error Handling
- **Non-existent resources**: Test 404 responses
- **Invalid UUIDs**: Test with malformed IDs
- **Cascade deletions**: Verify related data is properly handled
- **Complex relationships**: Test scenarios with multiple related entities

#### 9. Test Data Management
- Use `fixtures.insertX()` methods for test data creation
- Always use branded types (EventId, UserId, etc.) consistently
- Create realistic test scenarios with proper relationships
- Use `DateTime.now().plus({ days: 1 })` for future dates
- Use `DateTime.now().minus({ days: 1 })` for past dates

#### 10. Common Test Patterns
```typescript
// Test creation with relationships
it('should create resource with related data', async () => {
  const relatedId = await fixtures.insertRelatedResource({...})
  
  const response = await request.post(path).send({
    field: 'value',
    related_ids: [relatedId]
  }).expect(201)
  
  // Verify main table
  await expectTable(Fixtures.MAIN_TABLE).hasNumberOfRows(1)
  
  // Verify junction table
  await expectTable(Fixtures.JUNCTION_TABLE).hasNumberOfRows(1)
})
```

### Mandatory Checklist for Integration Tests
- [ ] Authentication test (401 for unauthenticated requests)
- [ ] Dynamic validation tests using `it.each`
- [ ] Database verification with `expectTable` for all mutations
- [ ] Permission/authorization tests
- [ ] Response structure validation
- [ ] Error handling for non-existent resources
- [ ] Cascade operations testing (where applicable)
- [ ] Proper fixtures usage and cleanup

### Examples to Follow
- `apps/api/src/user/infrastructure/controllers/user.controller.int-spec.ts`
- `apps/api/src/secret-santa/infrastructure/secret-santa.controller.int-spec.ts`
- `apps/api/src/event/infrastructure/event.controller.int-spec.ts`

## CQRS Use-Case Implementation Guidelines

This section provides comprehensive guidelines for implementing CQRS patterns in new domains, following the established patterns from the secret-santa domain.

### Domain Structure Organization

When creating a new domain, follow this strict folder structure:

```
apps/api/src/{domain-name}/
├── domain/
│   ├── command/           # Command definitions
│   ├── event/            # Domain events
│   ├── model/            # Domain models/aggregates
│   ├── query/            # Query definitions
│   └── repository/       # Repository interfaces
├── application/          # Use cases (handlers)
│   ├── command/          # Command handlers
│   ├── event/            # Event handlers
│   └── query/            # Query handlers
└── infrastructure/       # Controllers, modules, implementations
    ├── controllers/      # REST controllers
    ├── repository/       # Repository implementations
    └── {domain}.module.ts # NestJS module
```

### Naming Conventions

#### Commands
- **Class Name**: `{Action}{EntityName}Command` (e.g., `CreateWishlistCommand`)
- **File Name**: `{kebab-case-action}-{kebab-case-entity}.command.ts`
- **Result Type**: `{Action}{EntityName}Result` (e.g., `CreateWishlistResult`)

#### Queries
- **Class Name**: `{Action}{EntityName}Query` (e.g., `GetWishlistQuery`)
- **File Name**: `{kebab-case-action}-{kebab-case-entity}.query.ts`
- **Result Type**: `{Action}{EntityName}Result` (e.g., `GetWishlistResult`)

#### Events
- **Class Name**: `{EntityName}{PastTenseAction}Event` (e.g., `WishlistCreatedEvent`)
- **File Name**: `{kebab-case-entity}-{kebab-case-past-tense-action}.event.ts`

#### Use Cases (Handlers)
- **Class Name**: `{Action}{EntityName}UseCase` (e.g., `CreateWishlistUseCase`)
- **File Name**: `{kebab-case-action}-{kebab-case-entity}.use-case.ts`

### Command Implementation Template

```typescript
// domain/command/create-wishlist.command.ts
import { Command } from '@nestjs-architects/typed-cqrs'
import { ICurrentUser, EventId, WishlistDto } from '@wishlist/common'

export class CreateWishlistCommand extends Command<CreateWishlistResult> {
  public readonly currentUser: ICurrentUser
  public readonly eventId: EventId
  public readonly title: string
  public readonly description?: string

  constructor(props: {
    currentUser: ICurrentUser
    eventId: EventId
    title: string
    description?: string
  }) {
    super()
    this.currentUser = props.currentUser
    this.eventId = props.eventId
    this.title = props.title
    this.description = props.description
  }
}

export type CreateWishlistResult = WishlistDto
```

### Query Implementation Template

```typescript
// domain/query/get-wishlist.query.ts
import { Query } from '@nestjs-architects/typed-cqrs'
import { ICurrentUser, WishlistId, WishlistDto } from '@wishlist/common'

export class GetWishlistQuery extends Query<GetWishlistResult> {
  public readonly currentUser: ICurrentUser
  public readonly wishlistId: WishlistId

  constructor(props: {
    currentUser: ICurrentUser
    wishlistId: WishlistId
  }) {
    super()
    this.currentUser = props.currentUser
    this.wishlistId = props.wishlistId
  }
}

export type GetWishlistResult = WishlistDto | undefined
```

### Event Implementation Template

```typescript
// domain/event/wishlist-created.event.ts
import { WishlistId, EventId } from '@wishlist/common'

export class WishlistCreatedEvent {
  public readonly wishlistId: WishlistId
  public readonly eventId: EventId
  public readonly title: string
  public readonly ownerId: string
  public readonly description?: string

  constructor(props: {
    wishlistId: WishlistId
    eventId: EventId
    title: string
    ownerId: string
    description?: string
  }) {
    this.wishlistId = props.wishlistId
    this.eventId = props.eventId
    this.title = props.title
    this.ownerId = props.ownerId
    this.description = props.description
  }
}
```

### Command Handler Template

```typescript
// application/command/create-wishlist.use-case.ts
import { Inject } from '@nestjs/common'
import { CommandHandler, EventBus, IInferredCommandHandler } from '@nestjs/cqrs'
import { TransactionManager } from '@wishlist/api/database'
import { uuid, WishlistId } from '@wishlist/common'
import { WishlistRepository, WISHLIST_REPOSITORY, Wishlist, WishlistCreatedEvent, CreateWishlistCommand, CreateWishlistResult } from '../../domain'
import { wishlistMapper } from '../../infrastructure'

@CommandHandler(CreateWishlistCommand)
export class CreateWishlistUseCase implements IInferredCommandHandler<CreateWishlistCommand> {
  constructor(
    @Inject(WISHLIST_REPOSITORY)
    private readonly wishlistRepository: WishlistRepository,
    // Only if transaction is needed
    private readonly transactionManager: TransactionManager,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateWishlistCommand): Promise<CreateWishlistResult> {
    // 1. Create domain model
    const wishlist = Wishlist.create({
      id: this.wishlistRepository.newId(),
      title: command.title,
      description: command.description,
      eventId: command.eventId,
      ownerId: command.currentUser.id,
    })

    // 2. Save 
    await this.wishlistRepository.save(wishlist)

    // 3. Publish domain event if needed
    await this.eventBus.publish(
      new WishlistCreatedEvent({
        wishlistId: wishlist.id,
        eventId: wishlist.eventId,
        title: wishlist.title,
        ownerId: wishlist.ownerId,
        description: wishlist.description,
      }),
    )

    // 4. Return using mapper
    return wishlistMapper.toDto(wishlist)
  }
}
```

### Query Handler Template

```typescript
// application/query/get-wishlist.use-case.ts
import { Inject } from '@nestjs/common'
import { QueryHandler, IInferredQueryHandler } from '@nestjs/cqrs'
import { GetWishlistQuery, GetWishlistResult, WishlistRepository, WISHLIST_REPOSITORY } from '../../domain'
import { wishlistMapper } from '../../infrastructure'

@QueryHandler(GetWishlistQuery)
export class GetWishlistUseCase implements IInferredQueryHandler<GetWishlistQuery> {
  constructor(
    @Inject(WISHLIST_REPOSITORY)
    private readonly wishlistRepository: WishlistRepository,
  ) {}

  async execute(query: GetWishlistQuery): Promise<GetWishlistResult> {
    const wishlist = await this.wishlistRepository.findById(query.wishlistId)
    
    if (!wishlist) {
      return undefined
    }

    // Add security checks
    if (!wishlist.canBeViewedBy(query.currentUser)) {
      return undefined
    }

    // 4. Return using mapper
    return wishlistMapper.toDto(wishlist)
  }
}
```

### Event Handler Template

```typescript
// application/event/wishlist-created.use-case.ts
import { EventsHandler, IEventHandler } from '@nestjs/cqrs'
import { MailService } from '@wishlist/api/mail'
import { WishlistCreatedEvent } from '../../domain/event/wishlist-created.event'

@EventsHandler(WishlistCreatedEvent)
export class WishlistCreatedUseCase implements IEventHandler<WishlistCreatedEvent> {
  constructor(private readonly mailService: MailService) {}

  async handle(event: WishlistCreatedEvent): Promise<void> {
    // Handle side effects like sending emails, logging, etc.
    await this.mailService.send({
      to: event.ownerId,
      subject: 'Wishlist Created',
      template: 'wishlist-created',
      data: {
        title: event.title,
        eventId: event.eventId,
      },
    })
  }
}
```

### Domain Model Template

```typescript
// domain/model/wishlist.model.ts
import { WishlistId, EventId, WishlistDto, ICurrentUser } from '@wishlist/common'
import { randomUUID } from 'crypto'

export interface WishlistProps {
  id: WishlistId
  title: string
  description?: string
  eventId: EventId
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

export class Wishlist {
  public readonly id: WishlistId
  public readonly title: string
  public readonly description?: string
  public readonly eventId: EventId
  public readonly ownerId: string
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(props: WishlistProps) {
    this.id = props.id
    this.title = props.title
    this.description = props.description
    this.eventId = props.eventId
    this.ownerId = props.ownerId
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static create(props: {
    id: WishlistId
    title: string
    description?: string
    eventId: EventId
    ownerId: string
  }): Wishlist {
    const now = new Date()
    return new Wishlist({
      id: props.id,
      title: props.title,
      description: props.description,
      eventId: props.eventId,
      ownerId: props.ownerId,
      createdAt: now,
      updatedAt: now,
    })
  }

  // Business logic methods
  canBeViewedBy(user: ICurrentUser): boolean {
    return this.ownerId === user.id
  }

  canBeModifiedBy(user: ICurrentUser): boolean {
    return this.ownerId === user.id
  }

  updateTitle(title: string): Wishlist {
    return new Wishlist({
      ...this,
      title,
      updatedAt: new Date(),
    })
  }
}
```

### Repository Interface Template

```typescript
// domain/repository/wishlist.repository.ts
import { DrizzleTransaction } from '@wishlist/api/database'
import { WishlistId, EventId } from '@wishlist/common'
import { Wishlist } from '../model/wishlist.model'

export const WISHLIST_REPOSITORY = Symbol('WishlistRepository')

export interface WishlistRepository {
  newId(): WishlistId
  findById(id: WishlistId): Promise<Wishlist | undefined>
  findByIdOrFail(id: WishlistId): Promise<Wishlist>
  findByEventId(eventId: EventId): Promise<Wishlist[]>
  findByOwnerId(ownerId: string): Promise<Wishlist[]>
  save(wishlist: Wishlist, tx?: DrizzleTransaction): Promise<void>
  delete(id: WishlistId, tx?: DrizzleTransaction): Promise<void>
  existsById(id: WishlistId): Promise<boolean>
}
```

### Controller Template

```typescript
// infrastructure/controllers/wishlist.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '@wishlist/api/auth'
import {
  CreateWishlistInputDto,
  WishlistDto,
  WishlistId,
  EventId,
  ICurrentUser,
  UpdateWishlistInputDto,
} from '@wishlist/common'
import {
  CreateWishlistCommand,
  DeleteWishlistCommand,
  GetWishlistQuery,
  GetWishlistsByEventQuery,
  UpdateWishlistCommand,
} from '../domain'

@ApiTags('Wishlists')
@Controller('/wishlists')
export class WishlistController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('/')
  getWishlistsByEvent(
    @CurrentUser() currentUser: ICurrentUser,
    @Query('eventId') eventId: EventId,
  ): Promise<WishlistDto[]> {
    return this.queryBus.execute(
      new GetWishlistsByEventQuery({ currentUser, eventId }),
    )
  }

  @Get('/:id')
  getWishlist(
    @CurrentUser() currentUser: ICurrentUser,
    @Param('id') wishlistId: WishlistId,
  ): Promise<WishlistDto | undefined> {
    return this.queryBus.execute(
      new GetWishlistQuery({ currentUser, wishlistId }),
    )
  }

  @Post('/')
  createWishlist(
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: CreateWishlistInputDto,
  ): Promise<WishlistDto> {
    return this.commandBus.execute(
      new CreateWishlistCommand({
        currentUser,
        eventId: dto.event_id,
        title: dto.title,
        description: dto.description,
      }),
    )
  }

  @Put('/:id')
  async updateWishlist(
    @CurrentUser() currentUser: ICurrentUser,
    @Param('id') wishlistId: WishlistId,
    @Body() dto: UpdateWishlistInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateWishlistCommand({
        currentUser,
        wishlistId,
        title: dto.title,
        description: dto.description,
      }),
    )
  }

  @Delete('/:id')
  async deleteWishlist(
    @CurrentUser() currentUser: ICurrentUser,
    @Param('id') wishlistId: WishlistId,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteWishlistCommand({ currentUser, wishlistId }),
    )
  }
}
```

### Module Template

```typescript
// infrastructure/wishlist.module.ts
import { Module } from '@nestjs/common'
import { EventModule } from '@wishlist/api/event'
import { WishlistController } from './controllers/wishlist.controller'
import {
  CreateWishlistUseCase,
  UpdateWishlistUseCase,
  DeleteWishlistUseCase,
  GetWishlistUseCase,
  GetWishlistsByEventUseCase,
  WishlistCreatedUseCase,
} from '../application'

const handlers = [
  // Command handlers
  CreateWishlistUseCase,
  UpdateWishlistUseCase,
  DeleteWishlistUseCase,
  // Query handlers
  GetWishlistUseCase,
  GetWishlistsByEventUseCase,
  // Event handlers
  WishlistCreatedUseCase,
]

@Module({
  imports: [EventModule],
  controllers: [WishlistController],
  providers: [...handlers],
})
export class WishlistModule {}
```

### Key Implementation Rules

#### 1. Security First
- **Always include `currentUser: ICurrentUser`** in all commands and queries
- **Implement authorization checks** in domain models (`canBeViewedBy`, `canBeModifiedBy`)
- **Return 404 instead of 403** for unauthorized access to maintain privacy

#### 2. Type Safety
- **Use branded types** for all IDs (`WishlistId`, `EventId`, etc.)
- **Define result types** for all commands and queries
- **Use readonly properties** in domain models and commands/queries

#### 3. Transaction Management
- **Use `TransactionManager.runInTransaction`** only for operations involving multiple SQL queries
- **Skip transaction management** for single SQL operations (repository methods handle this internally)
- **Pass transaction context** to repository methods when needed for multi-operation transactions
- **Group related operations** in a single transaction

#### 4. Event Publishing
- **Publish domain events** after successful command execution
- **Use events for side effects** like sending emails, logging, etc.
- **Keep events focused** on domain-specific information

#### 5. Error Handling
- **Use domain exceptions** for business rule violations
- **Validate input** in command/query handlers
- **Handle not found cases** gracefully in queries

#### 6. Testing
- **Follow integration testing guidelines** from CLAUDE.md
- **Test all security scenarios** (authentication, authorization)
- **Verify database state** after mutations
- **Use dynamic validation testing** with `it.each`

### Domain Index Files

Create index files to export all domain objects:

```typescript
// domain/index.ts
export * from './command'
export * from './query'
export * from './event'
export * from './model'
export * from './repository'

// domain/command/index.ts
export * from './create-wishlist.command'
export * from './update-wishlist.command'
export * from './delete-wishlist.command'

// application/index.ts
export * from './command'
export * from './query'
export * from './event'
```

### Migration Checklist

When migrating existing domains to this pattern:

- [ ] Create proper folder structure
- [ ] Convert services to command/query handlers
- [ ] Extract domain models with business logic
- [ ] Define repository interfaces
- [ ] Implement domain events
- [ ] Add security checks to all handlers
- [ ] Update controllers to use CommandBus/QueryBus
- [ ] Write comprehensive integration tests
- [ ] Add transaction support
- [ ] Create proper index files for exports