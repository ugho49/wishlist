FROM node:20.8-alpine as base

FROM base AS builder

RUN apk add --update --no-cache g++ make py3-pip

WORKDIR /usr/src/app

COPY . .

RUN yarn --immutable

RUN yarn nx run api:build:production
RUN mv node_modules dist/apps/api/node_modules
RUN cd dist/apps/api && yarn workspaces focus --production

FROM base as production

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist

CMD ["node", "dist/apps/api/main"]
