# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Building and Running
- `yarn build` - Build all projects in the monorepo
- `yarn serve:front` - Start the React frontend development server
- `yarn serve:api` - Start the NestJS API development server
- `yarn serve:all` - Start all applications

### Testing
- `yarn test` - Run unit tests for all projects
- `yarn test:int` - Run integration tests
- `yarn check-types` - Run TypeScript type checking across projects

### Quality Assurance
- `yarn lint` - Run ESLint on all projects

### Database
- Database migrations are managed with Drizzle ORM
- Configuration in `apps/api/drizzle.config.ts`
- Schema defined in `apps/api/drizzle/schema.ts`
- Migrations in `apps/api/drizzle/migrations/`

### Docker
- `yarn docker:up` - Start local development environment with Docker
- `yarn docker:down` - Stop and clean up Docker containers

## Architecture Overview

This is an Nx monorepo containing a wishlist application with React frontend and NestJS backend.

### Project Structure
- **apps/api/** - NestJS backend API with TypeScript
- **apps/front/** - React frontend with TypeScript, Material-UI, and Redux
- **libs/common/** - Shared DTOs, enums, utilities, and interfaces
- **libs/api-client/** - Generated API client for frontend consumption

### Backend Architecture (NestJS)
- **Domain-Driven Design** with clear separation of concerns
- **CQRS pattern** using `@nestjs/cqrs` for complex operations (especially in secret-santa module)
- **Modular structure**: Core modules (database, mail, bucket) and Domain modules (auth, user, event, etc.)
- **Database**: PostgreSQL with Drizzle ORM (recently migrated from TypeORM)
- **Authentication**: JWT with Passport, includes Google OAuth integration
- **File uploads**: Firebase Storage integration via bucket service
- **Email**: MJML templates with Nodemailer

### Frontend Architecture (React)
- **State Management**: Redux Toolkit with React Query for server state
- **UI Framework**: Material-UI (MUI) with custom theme
- **Routing**: React Router DOM v7
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite

### Key Domain Concepts
- **Events**: Group wishlist sharing contexts
- **Wishlists**: Collections of items users want
- **Items**: Individual wishlist entries with web scraping support
- **Secret Santa**: Advanced feature with user exclusions and draw logic
- **Attendees**: Users participating in events

### Testing Strategy
- **Unit tests**: Vitest for both frontend and backend
- **Integration tests**: NestJS integration tests with test containers
- **Test utilities**: Located in `apps/api/src/test-utils/`

### Development Notes
- Uses Yarn as package manager with workspaces
- Node.js 22+ required
- ESLint and Prettier configured for code quality
- Follows conventional commits with commitlint
- Uses Husky for pre-commit hooks