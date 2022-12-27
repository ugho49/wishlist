FROM node:18.10.0-alpine AS builder

RUN apk add --update --no-cache g++ make py3-pip

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn --frozen-lockfile

COPY . .

RUN yarn nx run api:build:production

# remove dev deps
RUN yarn --frozen-lockfile --production && yarn cache clean

FROM node:18.10.0-alpine as production

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

COPY --from=builder /usr/src/app/node_modules node_modules
COPY --from=builder /usr/src/app/dist ./dist

CMD ["node", "dist/apps/api/main"]
