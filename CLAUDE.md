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