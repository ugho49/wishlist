import { Injectable } from '@znight/core';
import { SQL } from 'bun';

export type HealthIndicatorResult = Record<string, { status: 'up' | 'down' }>;

@Injectable()
export class DatabaseHealthIndicator {
  constructor(private readonly sql: SQL) {}

  async pingCheck(): Promise<HealthIndicatorResult> {
    try {
      await this.sql`SELECT 1`;
      return { database: { status: 'up' } };
    } catch {
      return { database: { status: 'down' } };
    }
  }
}
