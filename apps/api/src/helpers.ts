import type { LoggingOptions } from '@znight/observability';

import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import tracer from 'dd-trace';

import { CLIENT_IP_SCOPE_TOKEN, CURRENT_USER_SCOPE_TOKEN } from './auth/infrastructure/auth.context';
import { QUEUE_JOB_SCOPE_TOKEN, QUEUE_MESSAGE_ID_SCOPE_TOKEN } from './core/queue/queue.context';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '../..');

export const path = (...paths: string[]) => join(__dirname, ...paths);

const DEFAULT_HEALTHCHECK_PATH = '/health';

/**
 * Fields computed for every entry: the API version and, inside a dd-trace span, the Datadog trace
 * correlation (`dd.trace_id`, `dd.span_id`...). dd-trace's own pino hook patches `require('pino')`,
 * which never sees the ESM import of @znight/observability under Bun, so the ids are injected here.
 */
export function logMixin(): Record<string, unknown> {
  const record: Record<string, unknown> = { version: process.env.API_VERSION };
  const span = tracer.scope().active();
  if (span) {
    tracer.inject(span.context(), 'log', record);
  }
  return record;
}

/**
 * Datadog's error tracking reads `error`: the framework's entries (5xx requests, failed messages)
 * put the error under `err`, renamed here (the `error` serializer still applies after this formatter).
 */
export function renameErrKey(entry: Record<string, unknown>): Record<string, unknown> {
  if (entry.err === undefined || entry.error !== undefined) {
    return entry;
  }
  const { err, ...rest } = entry;
  return { ...rest, error: err };
}

/**
 * Logs shaped for Datadog, close to the previous pino-http setup: `message` / `error` keys, ISO
 * `timestamp`, level label, request id, client IP and current user in the request entries, message id
 * and job in the BullMQ job entries, Datadog trace ids, pretty output outside production, `/health`
 * not logged.
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
      messageId: QUEUE_MESSAGE_ID_SCOPE_TOKEN,
      job: QUEUE_JOB_SCOPE_TOKEN,
    },
    mixin: logMixin,
    requests: { ignore: event => event.path === DEFAULT_HEALTHCHECK_PATH },
    pino: {
      errorKey: 'error', // For Datadog's error tracking
      timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
      formatters: { level: (label: string) => ({ level: label }), log: renameErrKey },
    },
  };
}
