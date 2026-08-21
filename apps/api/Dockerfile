FROM oven/bun:1.3.13-alpine

ARG API_VERSION

WORKDIR /app

RUN apk add --no-cache python3 make g++ tzdata \
    && cp /usr/share/zoneinfo/Europe/Paris /etc/localtime \
    && echo "Europe/Paris" > /etc/timezone
ENV TZ=Europe/Paris

# pruned-package.json must be pre-generated in CI before docker build:
#   bun nx run api:generate-pruned-package-json
COPY apps/api/pruned-package.json ./package.json
COPY bun.lock ./
COPY apps/api ./apps/api
COPY libs ./libs
COPY tsconfig.base.json ./

RUN bun install --production --frozen-lockfile

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
