# `@wishlist/mail` (`libs/mail`)

react-email templates consumed by the API mail module.

## Layout

- `src/templates/` — one file per email; **default-export** the component (react-email preview discovers files that way). Also named-export the component and its props type for the API mapper.
- `src/components/` — shared layout and UI (`EmailLayout`, buttons, callouts)
- `src/styles.ts` — shared styles

## Commands

From the repo root: `bun mail:preview` (`bun nx run mail:preview`).

## Conventions

- Reuse `EmailLayout` and the UI primitives; do not duplicate header/footer markup in each template.
- Keep templates presentational. The API maps domain events to template props.
- Export `render` from `react-email` via `src/index.ts` — that is the API entry point to turn a template into HTML.
