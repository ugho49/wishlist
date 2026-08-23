# `@wishlist/common` (`libs/common`)

Shared TypeScript used by both the API and the frontend. Keep it small.

## What belongs here

- **Branded IDs** (`src/ids.ts`) — `EventId`, `UserId`, `WishlistId`, … plus `gqlScalarIds` for GraphQL codegen
- **Auth interface** — `ICurrentUser` and related types
- **Constants / feature flags / utils**
- **Secret Santa draw** service (pure logic, unit-tested here)
- **Remaining HTTP types** for the few REST multipart routes (`src/api/*.api.ts`), e.g. `CreateWishlistHttpRequest`

The index barrel imports `reflect-metadata` on purpose: Vite 8 may load this chunk before the app entry, and `class-validator` needs the polyfill as a real dependency of this module.

## What does not belong here

- Do **not** add REST DTOs for GraphQL operations. GraphQL types are generated in `apps/api` and `apps/front`.
- Do **not** put domain enums here. Domain enums live in `apps/api/src/{domain}/domain/`. The frontend uses GraphQL-generated enums.
- Do **not** put Nest or React code here.

## IDs

Use branded types everywhere IDs cross the wire. GraphQL scalars map to these brands via `gqlScalarIds`.
