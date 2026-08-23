# CLAUDE.md

Guidance for Claude Code when working in this repository.

Nested docs (read the one that matches the files you are changing):

- [`apps/api/CLAUDE.md`](apps/api/CLAUDE.md) — NestJS API, GraphQL, use cases, Drizzle, unit and integration tests
- [`apps/front/CLAUDE.md`](apps/front/CLAUDE.md) — React frontend, MUI, GraphQL documents, uploads
- [`libs/common/CLAUDE.md`](libs/common/CLAUDE.md) — shared branded IDs and remaining HTTP types
- [`libs/mail/CLAUDE.md`](libs/mail/CLAUDE.md) — react-email templates

## Development Commands

### Building and Running
- `bun build` — Build all projects in the monorepo
- `bun serve:all` — All applications concurrently
- `bun serve:front` — React frontend (port 4200)
- `bun serve:front:with-codegen` — Frontend + GraphQL codegen in watch mode
- `bun serve:api` — NestJS API
- `bun serve:api:with-codegen` — API + GraphQL codegen in watch mode
- `bun mail:preview` — Preview email templates

### GraphQL Codegen
After changing API `.graphql` schema files or frontend operation documents:
- `nx run api:codegen` — API types (`apps/api/src/gql/generated-types.ts`) and stitched schema (`apps/api/schema.graphql`)
- `nx run front:codegen` — Frontend types and React Query hooks from `apps/api/schema.graphql` + `apps/front/src/**/*.graphql`

### Testing and Quality
- `bun test:unit` — Unit tests (bun:test for API and libs, Vitest for the front)
- `bun test:int` — API integration tests with Docker Compose
- `bun typecheck` — TypeScript across all projects
- `bun check` / `bun check:fix` — Biome (replaces ESLint / Prettier)
- Single test: `nx test <project-name>`
- Pre-commit: lint-staged + Biome; conventional commits via commitlint

### TypeScript (two packages on purpose)
TypeScript 7 ships a native `tsc` but **no compiler API** — `require('typescript')` only exports `version`. Nx, Vite, and `@nx/js:tsc` still import that API, so `"typescript": "7.x"` as a drop-in breaks the workspace (`readConfigFile is not a function`). Bun as runtime does not change this.

Keep both until TypeScript 7 exposes a stable programmatic API that Nx supports (expected around 7.1):

- `@typescript/native` (`npm:typescript@7.x`) — the `tsc` binary used by `bun typecheck`
- `typescript` (`npm:@typescript/typescript6@6.x`) — JS API for Nx / Vite / plugin builds

When bumping: raise `@typescript/native` for the compiler, and the `typescript` alias only for 6.x patches. Collapse to a single `typescript` dependency only after Nx can `require('typescript')` on 7.x. See the [Nx TypeScript 7 guide](https://nx.dev/docs/technologies/typescript/guides/typescript-7).

### Database
- `bun nx run api:drizzle:studio` — Drizzle Studio
- `bun nx run api:drizzle:generate --name <migration-name>`
- `bun nx run api:drizzle:migrate` / `bun db:migrate`
- `bun nx run api:drizzle:seed` / `bun db:seed`
- Schema: `apps/api/drizzle/schema/` (barrel: `index.ts`)
- Migrations: `apps/api/drizzle/migrations/`

Details: [`apps/api/CLAUDE.md`](apps/api/CLAUDE.md).

### Docker
- `bun docker:up` — PostgreSQL, MailDev, Adminer
- `bun docker:down` — Stop and clean up

## Architecture Overview

Nx monorepo, **Bun** as runtime and package manager.

| Path | Role |
| --- | --- |
| `apps/api/` | NestJS backend (DDD + GraphQL) |
| `apps/front/` | React frontend (Vite, MUI, Redux Toolkit) |
| `libs/common/` | Branded IDs, interfaces, leftover HTTP types for REST uploads |
| `libs/mail/` | react-email templates consumed by the API |

The public API is **GraphQL** at `POST /graphql`. REST remains only for multipart uploads and `GET /health`. Do not add REST unless the operation needs a file upload.

### Domain concepts
- **Events** — central concept for wishlist sharing; event dates are mandatory
- **Attendees** — CREATOR / ADMIN / PARTICIPANT
- **Wishlists** — user collections linked to events
- **Items** — entries with scraping metadata and reservation
- **Secret Santa** — exclusions, budget, automated draw

### Workflow
- **Nx** with build dependencies and caching
- **Biome** for lint/format (security rules + import sorting)
- **Husky** for pre-commit formatting and conventional commits
- **Bun** as package manager
