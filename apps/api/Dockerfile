# Keep in sync with .bun-version
FROM oven/bun:1.4.0-alpine

ARG API_VERSION

WORKDIR /app

RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/Europe/Paris /etc/localtime \
    && echo "Europe/Paris" > /etc/timezone
ENV TZ=Europe/Paris

# Must be pre-generated before docker build:
#   bun nx run api:generate-pruned-package-json
COPY apps/api/pruned-package.json ./package.json
COPY apps/api/pruned-bun.lock ./bun.lock
COPY bunfig.toml ./
COPY patches ./patches

RUN bun install --production --frozen-lockfile

COPY tsconfig.base.json ./
COPY apps/api ./apps/api
COPY libs ./libs

WORKDIR /app/apps/api

ENV PORT=3000
ENV NODE_ENV=production
ENV API_VERSION=${API_VERSION}

# Datadog environment variables
ENV DD_ENV=prod
ENV DD_SERVICE=wishlist-api
ENV DD_VERSION=${API_VERSION}
ENV DD_LOGS_INJECTION=true
ENV DD_TRACE_SAMPLE_RATE=1
ENV DD_RUNTIME_METRICS_ENABLED=true

EXPOSE 3000

CMD ["bun", "run", "src/main.ts"]
