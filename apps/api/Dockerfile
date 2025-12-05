FROM oven/bun:1.1.44-alpine as base

FROM base AS builder

RUN apk add --update --no-cache g++ make py3-pip

WORKDIR /usr/src/app

COPY . .

RUN bun install --frozen-lockfile

RUN bun nx run api:build:production

RUN bun install --production --no-save

FROM base as production

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/node_modules node_modules
COPY --from=builder /usr/src/app/dist ./dist

CMD ["bun", "run", "dist/apps/api/main"]
