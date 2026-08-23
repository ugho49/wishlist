# 🎁 Wishlist

Share wishlists for birthdays, holidays, and other events. Invite people, reserve gifts without spoiling the surprise, and run Secret Santa draws.

**Live app:** [wishlistapp.fr](https://wishlistapp.fr)

## ✨ Features

- 📅 Events with dates and attendees
- 📝 Wishlists with optional link scraping
- 🔒 Hidden item reservations
- 🎅 Secret Santa (exclusions + budget)
- 🔐 Email + Google sign-in

## 🛠️ Stack

Nx monorepo, **Bun** runtime.

| Layer | Tech |
| --- | --- |
| API | NestJS, GraphQL (Yoga), PostgreSQL, Drizzle |
| Front | React, Vite, MUI, TanStack Router / Query |
| Mail | react-email |
| Auth | JWT + Google OAuth |
| Uploads | Firebase |

The public API is GraphQL (`POST /graphql`). REST is only used for file uploads and `GET /health`.

```
apps/api      NestJS backend
apps/front    React frontend
libs/common   Shared IDs and types
libs/mail     Email templates
```

## 🚀 Quick start

**Needs:** [Bun](https://bun.sh) and Docker.

```bash
git clone https://github.com/ugho49/wishlist.git
cd wishlist
bun install

bun docker:up                              # Postgres, MailDev, Valkey
cp apps/api/.env.example apps/api/.env     # Front already has .env.development
bun db:migrate
bun db:seed                                # optional
bun serve:all
```

| Service | URL |
| --- | --- |
| Front | http://localhost:4200 |
| API | http://localhost:8080 |
| GraphQL (GraphiQL in dev) | http://localhost:8080/graphql |
| MailDev | http://localhost:1080 |

## 📝 Commands

```bash
bun serve:front / bun serve:api / bun serve:all
bun serve:front:with-codegen               # + GraphQL codegen watch
bun serve:api:with-codegen

bun test:unit
bun test:int
bun typecheck
bun check / bun check:fix

bun db:migrate / bun db:seed
nx run api:drizzle:studio
nx run api:drizzle:generate --name <name>

bun mail:preview
bun docker:up / bun docker:down
```

## 🤝 Contributing

Conventional commits. Before a PR: `bun check`, `bun typecheck`, `bun test:unit`.

Agent / coding conventions live in [CLAUDE.md](CLAUDE.md) (and the nested ones under `apps/` and `libs/`).
