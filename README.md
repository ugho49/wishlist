# 🎁 Wishlist App

A modern, full-stack wishlist application built for sharing wishlists during events like birthdays, holidays, and special occasions. Create events, invite friends, manage wishlists, and even organize Secret Santa draws with advanced features.

**Live Application**: [https://wishlistapp.fr](https://wishlistapp.fr)

## 📖 What is Wishlist App?

Wishlist App is a collaborative platform designed to make gift-giving easier and more organized. Whether you're planning a birthday party, holiday celebration, wedding, or any special occasion, this app helps coordinate wishlists among groups of people.

### 🎯 Core Concept

The app revolves around **Events** - special occasions where people want to share their wishlists. Each event has:

- **A specific date** (birthday, holiday, wedding date, etc.)
- **Multiple participants** who can join and share their wishlists
- **Role-based access** (event maintainers vs. participants)
- **Privacy controls** for wishlist visibility and item reservations

### 🔄 How It Works

1. **Create an Event** 📅
   - Set a date for your special occasion
   - Give it a meaningful name and description
   - Invite friends and family by email

2. **Build Your Wishlist** 📝
   - Add items with descriptions, prices, and links
   - Upload photos or let the app scrape web pages automatically
   - Organize items by priority or category

3. **Share and Discover** 👥
   - View other participants' wishlists (if they allow it)
   - Get inspiration from what others want
   - See what's already been reserved by other gift-givers

4. **Reserve Items Privately** 🔒
   - Mark items you plan to buy (only you can see your reservations)
   - Prevent duplicate gifts without spoiling surprises
   - Get notifications about availability

5. **Secret Santa Magic** 🎅
   - Automatically assign gift-givers to recipients
   - Set budget constraints and exclusion rules
   - Handle complex family dynamics (avoid spouses, etc.)

### 🌟 Real-World Scenarios

**Family Birthday Party**
- Mom creates a birthday event for her daughter
- Extended family members join and see the wishlist
- Grandparents reserve the expensive items, cousins pick smaller gifts
- No duplicate presents, everyone's happy!

**Office Holiday Exchange**
- HR creates a company holiday event
- Employees join and add their wishlists
- Secret Santa draw handles the gift assignments automatically
- Budget limits ensure fairness ($20-50 range)

**Wedding Registry**
- Couple creates their wedding event
- Guests can view and reserve registry items
- Prevents duplicate gifts and ensures they get what they really want
- Easy coordination among many gift-givers

### 🔐 Privacy & Security

- **Selective sharing**: Choose who can see your wishlist
- **Private reservations**: Your gift plans remain secret
- **Secure authentication**: Google OAuth or email/password
- **Role-based permissions**: Event creators have more control than participants

### 💡 Why Use Wishlist App?

**For Gift Recipients:**
- Get exactly what you want
- Avoid unwanted duplicates
- Share inspiration with loved ones
- Keep wishlists organized by occasion

**For Gift Givers:**
- Know exactly what they want
- See what's available vs. already claimed
- Stay within budget with price information
- Coordinate with other gift-givers seamlessly

**For Event Organizers:**
- Simplify group gift coordination
- Handle complex Secret Santa scenarios
- Manage participant permissions
- Keep everything organized in one place

## ✨ Features

### Core Features
- 📝 **Event Management**: Create and manage events with dates and attendees
- 🎯 **Wishlist Creation**: Build detailed wishlists with web scraping for automatic metadata
- 👥 **Event Sharing**: Invite participants with role-based permissions (maintainer/participant)
- 🔒 **Item Reservations**: Reserve items privately to prevent duplicate gifts
- 🎅 **Secret Santa**: Advanced Secret Santa functionality with exclusion rules and budget constraints
- 🔐 **Authentication**: Secure JWT-based auth with Google OAuth integration
- 📱 **Responsive Design**: Modern Material-UI interface optimized for all devices

### Technical Features
- 🏗️ **Domain-Driven Design**: Clean architecture with CQRS pattern
- 🔄 **Real-time Updates**: Optimistic UI updates with React Query
- 🎨 **Modern UI/UX**: Material-UI v7 with custom theming
- 📊 **Type Safety**: End-to-end TypeScript with branded types
- 🧪 **Comprehensive Testing**: Unit and integration tests with Testcontainers
- 🔧 **Developer Experience**: Hot reload, ESLint, Prettier, and conventional commits

## 🏗️ Architecture

This is an **Nx monorepo** featuring:

### Backend (NestJS)
- **Architecture**: Domain-Driven Design with CQRS pattern
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT with Google OAuth
- **Email**: MJML templates with Nodemailer
- **Storage**: Firebase for file uploads
- **API Documentation**: OpenAPI/Swagger

### Frontend (React 19)
- **State Management**: Redux Toolkit + React Query
- **UI Framework**: Material-UI v7 with custom themes
- **Routing**: React Router DOM v7
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite with SWC

### Shared Libraries
- **common**: Shared DTOs, types, and interfaces
- **api-client**: Type-safe generated API client

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 24.x or later
- **Yarn**: 4.9.2 or later
- **Docker**: For local database
- **Git**: For version control

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd wishlist
```

2. **Install dependencies**
```bash
yarn install
```

3. **Start local services**
```bash
yarn docker:up
```
This starts PostgreSQL, MailDev, and Adminer for local development.

4. **Run database migrations**
```bash
nx run api:drizzle:migrate
```

5. **Start the development servers**
```bash
# Start both frontend and backend
yarn serve:all

# Or start them separately
yarn serve:front    # React app on port 4200
yarn serve:api      # NestJS API on port 3000
```

### Environment Setup

Create environment files based on the examples:

```bash
# Backend environment
cp apps/api/.env.example apps/api/.env.local

# Frontend environment
cp apps/front/.env.example apps/front/.env.local
```

Configure your environment variables for:
- Database connection
- JWT secrets
- Google OAuth credentials
- Firebase configuration
- Email service settings

## 📝 Development

### Available Scripts

#### Building and Running
```bash
yarn build           # Build all projects
yarn serve:front     # Start React frontend (port 4200)
yarn serve:api       # Start NestJS API (port 3000)
yarn serve:all       # Start all applications concurrently
```

#### Testing
```bash
yarn test           # Run unit tests with Vitest
yarn test:int       # Run integration tests with Testcontainers
yarn check-types    # TypeScript type checking
```

#### Code Quality
```bash
yarn lint           # Run ESLint on all projects
```

#### Database Operations
```bash
# Open Drizzle Studio (database UI)
nx run api:drizzle:studio

# Generate new migration
nx run api:drizzle:generate --name <migration-name>

# Run migrations
nx run api:drizzle:migrate
```

#### Docker Environment
```bash
yarn docker:up     # Start PostgreSQL, MailDev, Adminer
yarn docker:down   # Stop and cleanup containers
```

### Local Services

When running `yarn docker:up`, you'll have access to:

- **PostgreSQL**: Database on port 5432
- **MailDev**: Email testing interface at http://localhost:1080
- **Adminer**: Database admin interface at http://localhost:8080

### Project Structure

```
├── apps/
│   ├── api/              # NestJS backend
│   │   ├── src/
│   │   │   ├── auth/     # Authentication module
│   │   │   ├── event/    # Event management
│   │   │   ├── wishlist/ # Wishlist functionality
│   │   │   ├── item/     # Wishlist items
│   │   │   └── secret-santa/ # Secret Santa features
│   │   └── drizzle/      # Database schema & migrations
│   └── front/            # React frontend
│       └── src/
│           ├── components/
│           ├── pages/
│           ├── store/    # Redux store
│           └── services/ # API services
├── libs/
│   ├── common/          # Shared types and DTOs
│   └── api-client/      # Generated API client
├── docker/              # Docker configuration
└── tools/               # Build tools and scripts
```

## 🧪 Testing

### Unit Tests
```bash
yarn test
```
Uses Vitest across all projects with 20s timeout for comprehensive test coverage.

### Integration Tests
```bash
yarn test:int
```
Uses Testcontainers with Docker Compose for real database testing scenarios.

### Test Architecture
- **Unit Tests**: Fast, isolated component and service tests
- **Integration Tests**: Full request/response cycle with real database
- **Test Utilities**: Comprehensive fixtures and assertions
- **Coverage**: V8 coverage reports with Vitest

## 🚢 Deployment

The application is deployed at [https://wishlistapp.fr](https://wishlistapp.fr).

### Production Build
```bash
yarn build
```

### Environment Variables
Ensure all required environment variables are configured:

**Backend (.env)**:
- `DATABASE_URL`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `FIREBASE_*` variables
- `SMTP_*` email configuration

**Frontend (.env)**:
- `VITE_API_URL`
- `VITE_GOOGLE_CLIENT_ID`

## 🛠️ Technology Stack

### Backend
- **Framework**: NestJS 11.x
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT + Passport + Google OAuth
- **Architecture**: CQRS with `@nestjs/cqrs`
- **Email**: MJML + Nodemailer
- **Storage**: Firebase Admin SDK
- **Validation**: class-validator + class-transformer
- **Testing**: Vitest + Testcontainers

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite + SWC
- **UI Library**: Material-UI v7
- **State Management**: Redux Toolkit + React Query
- **Routing**: React Router DOM v7
- **Forms**: React Hook Form + Zod
- **Styling**: Emotion + styled components
- **Testing**: Vitest + Testing Library

### DevOps & Tooling
- **Monorepo**: Nx 21.x
- **Package Manager**: Yarn 4.x with workspaces
- **Code Quality**: ESLint + Prettier + Husky
- **Commits**: Conventional commits with commitlint
- **Database**: Drizzle Kit for migrations
- **Docker**: Development environment

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow the coding standards**:
   - Use conventional commits
   - Run tests: `yarn test`
   - Check types: `yarn check-types`
   - Lint code: `yarn lint`
4. **Commit changes**: `git commit -m 'feat: add amazing feature'`
5. **Push to branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Code Style
- **TypeScript**: Strict mode enabled
- **ESLint**: Security rules enforced
- **Prettier**: Auto-formatting with import sorting
- **Commits**: Conventional commit format required

---

Built with ❤️ using modern web technologies and best practices.
