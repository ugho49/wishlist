# Keep in sync with .bun-version
FROM oven/bun:1.4.0-alpine

ARG API_VERSION

WORKDIR /app

RUN apk add --no-cache python3 make g++ tzdata \
    && cp /usr/share/zoneinfo/Europe/Paris /etc/localtime \
    && echo "Europe/Paris" > /etc/timezone
ENV TZ=Europe/Paris

COPY bunfig.toml bun.lock package.json ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/front/package.json ./apps/front/package.json
COPY libs/api-client/package.json ./libs/api-client/package.json
COPY libs/common/package.json ./libs/common/package.json
COPY libs/mail/package.json ./libs/mail/package.json
COPY plugin/biome-plugin/package.json ./plugin/biome-plugin/package.json
COPY plugin/drizzle-plugin/package.json ./plugin/drizzle-plugin/package.json

# --ignore-scripts skips the root "husky" postinstall (dev-only). Native
# addons listed in trustedDependencies still ship prebuilt binaries.
RUN bun install --frozen-lockfile --production --ignore-scripts

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
