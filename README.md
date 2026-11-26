<p align="center">
  <a href="https://wishlistapp.fr">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="apps/front/src/assets/logo/logo-dark.png" />
      <img src="apps/front/src/assets/logo/logo-light.png" alt="Wishlist" height="120" />
    </picture>
  </a>
</p>

<p align="center">
  Share wishlists for birthdays, holidays, and other events.<br />
  Invite people, reserve gifts without spoiling the surprise, and run Secret Santa draws.
</p>

<p align="center">
  <a href="https://wishlistapp.fr"><b>wishlistapp.fr</b></a>
</p>

## ✨ Features

- 📅 Events with dates and attendees, invited by email even before they sign up
- 📝 Wishlists with optional link scraping, co-owners, and imports from past lists
- 🔒 Hidden reservations, which several people can share for one gift
- 💡 Wish suggestions on someone else's list
- 🎅 Secret Santa (exclusions, budget, automatic draw)
- 🔔 Birthday and new-wish email reminders
- 📱 Installable as a PWA
- 🔐 Email and Google sign-in

<p align="center">
  <img src="apps/front/src/assets/mascot/genie-hello.png" alt="" height="88" />
  <img src="apps/front/src/assets/mascot/genie-calendar.png" alt="" height="88" />
  <img src="apps/front/src/assets/mascot/genie-wishlist.png" alt="" height="88" />
  <img src="apps/front/src/assets/mascot/genie-santa.png" alt="" height="88" />
  <img src="apps/front/src/assets/mascot/genie-lost.png" alt="" height="88" />
</p>

## 🛠️ Stack

Nx monorepo, **Bun** runtime.

| Layer   | Tech                                      |
| ------- | ----------------------------------------- |
| API     | Znight, GraphQL, PostgreSQL, Drizzle      |
| Front   | React, Vite, MUI, TanStack Router / Query |
| Mail    | react-email                               |
| Auth    | JWT + Google OAuth                        |
| Uploads | Firebase                                  |

The public API is GraphQL (`POST /graphql`). REST is only used for file uploads and `GET /health`.

```
apps/api      Znight backend
apps/front    React frontend
libs/common   Shared IDs and types
libs/mail     Email templates
```

## 🧞 Brand

The genie is the mascot. Navy (`#255376`) leads the UI, with the mist blue-grey (`#BFD4D7`) for soft surfaces. Headings use Fredoka and body text uses Inter.

| Asset                                                         | Where                                                                     |
| ------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Logos: `logo-*` (genie + lettering), `wordmark-*` (lettering) | `apps/front/src/assets/logo`, `-light` on white, `-dark` on navy          |
| Genie poses: hello, calendar, wishlist, santa, lost           | `apps/front/src/assets/mascot`, rendered by `components/common/Genie.tsx` |
| Favicon, PWA icons, OG image, email logo                      | `apps/front/public`                                                       |

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

| Service                   | URL                           |
| ------------------------- | ----------------------------- |
| Front                     | http://localhost:4200         |
| API                       | http://localhost:8080         |
| GraphQL (GraphiQL in dev) | http://localhost:8080/graphql |
| MailDev                   | http://localhost:1080         |

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
