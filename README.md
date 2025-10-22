# 🎁 Wishlist App

A modern, full-stack wishlist application for sharing wishlists during events like birthdays, holidays, and special occasions. Create events, invite friends, manage wishlists, and organize Secret Santa draws.

**Live Application**: [https://wishlistapp.fr](https://wishlistapp.fr)

## 📖 What is Wishlist App?

Wishlist App is a collaborative platform designed to make gift-giving easier and more organized. The app revolves around **Events** - special occasions where people share their wishlists with multiple participants.

### Key Features

- 📝 **Event Management**: Create events with dates and invite attendees
- 🎯 **Wishlist Creation**: Build wishlists with automatic web scraping for metadata
- 👥 **Collaboration**: Role-based permissions for maintainers and participants
- 🔒 **Private Reservations**: Reserve items secretly to prevent duplicate gifts
- 🎅 **Secret Santa**: Automated gift assignments with exclusion rules and budget constraints
- 🔐 **Secure Authentication**: JWT + Google OAuth integration

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 24+ ([.nvmrc](.nvmrc))
- **Yarn**: 4.10.3+
- **Docker**: For local database

### Installation

1. **Clone and install**
```bash
git clone <repository-url>
cd wishlist
yarn install
```

2. **Start local services**
```bash
yarn docker:up  # Starts PostgreSQL, MailDev, and Adminer
```

3. **Setup environment**
```bash
# Copy and configure environment files
cp apps/api/.env.example apps/api/.env.local
cp apps/front/.env.example apps/front/.env.local
```

4. **Run migrations and start**
```bash
nx run api:drizzle:migrate
yarn serve:all  # Frontend on :4200, API on :3000
```

### Local Services

- **Frontend**: http://localhost:4200
- **API**: http://localhost:3000
- **API Docs**: http://localhost:3000/swagger
- **MailDev**: http://localhost:1080
- **Adminer**: http://localhost:8080

## 📝 Development

### Common Commands

```bash
# Development
yarn serve:all          # Start all apps
yarn serve:front        # Start React frontend only
yarn serve:api          # Start NestJS API only

# Testing
yarn test              # Unit tests (Vitest)
yarn test:int          # Integration tests (Testcontainers)
yarn typecheck         # TypeScript type checking

# Code Quality
yarn check             # Run Biome linting
yarn check:fix         # Fix Biome violations

# Database
nx run api:drizzle:studio                      # Open database UI
nx run api:drizzle:generate --name <name>      # Generate migration
nx run api:drizzle:migrate                     # Run migrations
nx run api:drizzle:seed                        # Seed database

# Docker
yarn docker:up         # Start services
yarn docker:down       # Stop services
```

## 🏗️ Architecture

**Nx monorepo** with strict separation of concerns:

### Backend (NestJS)
- **Architecture**: Domain-Driven Design with CQRS pattern
- **Database**: PostgreSQL 17 + Drizzle ORM
- **Authentication**: JWT + Google OAuth
- **Email**: MJML templates + Nodemailer
- **Storage**: Firebase for uploads
- **Testing**: Vitest + Testcontainers

### Frontend (React 19)
- **UI Framework**: Material-UI v7
- **State Management**: Redux Toolkit (client) + React Query (server)
- **Routing**: React Router DOM v7
- **Forms**: React Hook Form + Zod validation
- **Build Tool**: Vite + SWC

### Project Structure
```
├── apps/
│   ├── api/                    # NestJS backend
│   │   ├── src/{domain}/       # DDD modules (auth, event, wishlist, item, etc.)
│   │   └── drizzle/            # Database schema & migrations
│   └── front/                  # React frontend
├── libs/
│   ├── common/                 # Shared DTOs, types, branded types
│   └── api-client/             # Generated type-safe API client
└── docker/                     # Docker Compose configuration
```

## 🧪 Testing

- **Unit Tests**: Fast, isolated tests with Vitest
- **Integration Tests**: Full request/response cycle with real PostgreSQL (Testcontainers)
- **Test Utilities**: Comprehensive fixtures and assertions in `apps/api/src/test-utils/`

## 🛠️ Technology Stack

### Core Technologies
- **Backend**: NestJS 11 + PostgreSQL 17 + Drizzle ORM
- **Frontend**: React 19 + Vite + Material-UI v7
- **Monorepo**: Nx 21.6.5
- **Package Manager**: Yarn 4.10.3
- **Code Quality**: Biome (replaces ESLint + Prettier)
- **Testing**: Vitest + Testcontainers

### Key Libraries
- **State**: Redux Toolkit, React Query
- **Authentication**: Passport, JWT, Google OAuth
- **Validation**: Zod, class-validator
- **Email**: MJML, Nodemailer
- **Storage**: Firebase Admin SDK
- **Commits**: Conventional commits (Husky + commitlint)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Follow coding standards:
   - Use conventional commits
   - Run `yarn test` and `yarn typecheck`
   - Run `yarn check` before committing
4. Commit: `git commit -m 'feat: add amazing feature'`
5. Push and open a Pull Request

## 📚 Documentation

For detailed development guidelines, see [CLAUDE.md](CLAUDE.md):
- CQRS implementation patterns
- Integration testing guidelines
- Domain structure organization
- Frontend styling guidelines

---

Built with ❤️ using modern web technologies and best practices.
