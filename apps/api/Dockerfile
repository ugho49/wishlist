FROM node:19.9-alpine AS builder

RUN apk add --update --no-cache g++ make py3-pip

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn --frozen-lockfile

COPY . .

RUN yarn nx run api:build:production
RUN mv node_modules dist/apps/api/node_modules
RUN cd dist/apps/api && yarn --frozen-lockfile --production

FROM node:19.9-alpine as production

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist

CMD ["node", "dist/apps/api/main"]
