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
- `yarn check-types` - Run TypeScript type checking across all projects
- Single test execution: Use Nx to run specific tests: `nx test <project-name>`

### Quality Assurance
- `yarn lint` - Run ESLint on all projects
- Pre-commit hooks automatically format staged files with Prettier
- Conventional commits enforced via commitlint

### Database Operations
- **Drizzle Studio**: `nx run api:drizzle:studio` - Open database management UI
- **Generate Migration**: `nx run api:drizzle:generate --name <migration-name>`
- **Run Migrations**: `nx run api:drizzle:migrate`
- **Schema**: Located in `apps/api/drizzle/schema.ts`
- **Migrations**: Stored in `apps/api/drizzle/migrations/`

### Docker Environment
- `yarn docker:up` - Start PostgreSQL, MailDev, and Adminer for development
- `yarn docker:down` - Stop and clean up Docker containers
- Adminer available for database management in local environment

## Architecture Overview

This is an Nx monorepo containing a wishlist application with React 19 frontend and NestJS backend, requiring Node.js 22+.

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
- **UI Framework**: Material-UI (MUI) v6 with custom theming system
- **Routing**: React Router DOM v7 with modern data loading patterns
- **Form Handling**: React Hook Form with Zod schema validation
- **Build Tool**: Vite with SWC for fast compilation and SVGR for SVG imports

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
- **Monorepo**: Nx 21.1.2 with proper build dependencies and caching
- **Code Quality**: ESLint with security rules, Prettier with import sorting
- **Git Hooks**: Husky for pre-commit formatting and conventional commit validation
- **Package Manager**: Yarn 4.9.2 with workspaces

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
  .check()

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
  .check()

// For deletion tests
await request.delete(path(id)).expect(200)
await expectTable(Fixtures.TABLE_NAME).hasNumberOfRows(0).check()
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
  await expectTable(Fixtures.TABLE_NAME).hasNumberOfRows(1).check()
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
  await expectTable(Fixtures.MAIN_TABLE).hasNumberOfRows(1).check()
  
  // Verify junction table
  await expectTable(Fixtures.JUNCTION_TABLE).hasNumberOfRows(1).check()
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