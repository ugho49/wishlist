FROM node:24.4-alpine as base

FROM base AS builder

RUN apk add --update --no-cache g++ make py3-pip

WORKDIR /usr/src/app

COPY . .

RUN yarn --immutable

RUN yarn nx run api:build:production

RUN yarn workspaces focus --production

FROM base as production

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/node_modules node_modules
COPY --from=builder /usr/src/app/dist ./dist

CMD ["node", "dist/apps/api/main"]
