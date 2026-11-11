import type { LoggingOptions } from '@znight/observability';

import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { CLIENT_IP_SCOPE_TOKEN, CURRENT_USER_SCOPE_TOKEN } from './auth/infrastructure/auth.context';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '../..');

export const path = (...paths: string[]) => join(__dirname, ...paths);

const DEFAULT_HEALTHCHECK_PATH = '/health';

/**
 * Logs shaped for Datadog, close to the previous pino-http setup: `message` / `error` keys, ISO
 * `timestamp`, level label, request id, client IP and current user in the request entries, pretty
 * output outside production, `/health` not logged.
 */
export function loggingOptions(serviceName: string): LoggingOptions {
  const pretty = process.env.NODE_ENV !== 'production';

  return {
    level: 'info',
    name: serviceName,
    messageKey: 'message', // For Datadog
    // `timestamp` key in ISO format, for Datadog (set through the raw pino options below)
    timestamp: false,
    base: { service: serviceName },
    pretty,
    scopeFields: {
      requestId: '@znight/http#RequestId',
      currentUser: CURRENT_USER_SCOPE_TOKEN,
      ip: CLIENT_IP_SCOPE_TOKEN,
    },
    mixin: () => ({ version: process.env.API_VERSION }),
    requests: { ignore: event => event.path === DEFAULT_HEALTHCHECK_PATH },
    pino: {
      errorKey: 'error', // For Datadog's error tracking
      timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
      formatters: { level: (label: string) => ({ level: label }) },
    },
  };
}
