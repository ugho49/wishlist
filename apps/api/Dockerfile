FROM node:24.12-alpine as base

ARG API_VERSION

FROM base AS builder

RUN apk add --update --no-cache g++ make py3-pip

WORKDIR /usr/src/app

COPY . .

RUN yarn --immutable
RUN yarn nx run api:build:production
RUN yarn workspaces focus --production
RUN cd dist/apps/api && yarn install --immutable

FROM base as production

ENV API_VERSION=${API_VERSION}
ENV DD_VERSION=${API_VERSION}
ENV PORT=3000

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/apps/api/main"]
