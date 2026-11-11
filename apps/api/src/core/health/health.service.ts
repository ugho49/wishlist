import { Injectable } from '@znight/core';

import { DatabaseHealthIndicator, type HealthIndicatorResult } from './database.indicator';

export type HealthCheckStatus = 'ok' | 'error';

/** The body of `GET /health`, the shape of the previous Terminus health check. */
export type HealthCheckResult = {
  status: HealthCheckStatus;
  info: HealthIndicatorResult;
  error: HealthIndicatorResult;
  details: HealthIndicatorResult;
};

@Injectable()
export class HealthService {
  constructor(private readonly databaseHealthIndicator: DatabaseHealthIndicator) {}

  async check(): Promise<HealthCheckResult> {
    const results = [await this.databaseHealthIndicator.pingCheck()];
    const info: HealthIndicatorResult = {};
    const error: HealthIndicatorResult = {};
    const details: HealthIndicatorResult = {};

    for (const result of results) {
      for (const [key, value] of Object.entries(result)) {
        details[key] = value;
        if (value.status === 'up') info[key] = value;
        else error[key] = value;
      }
    }

    return { status: Object.keys(error).length === 0 ? 'ok' : 'error', info, error, details };
  }
}
