import { Injectable } from '@znight/core';

import { DatabaseService } from '../database/database.service';

export type HealthIndicatorResult = Record<string, { status: 'up' | 'down' }>;

@Injectable()
export class DatabaseHealthIndicator {
  constructor(private readonly databaseService: DatabaseService) {}

  async pingCheck(): Promise<HealthIndicatorResult> {
    try {
      await this.databaseService.ping();
      return { database: { status: 'up' } };
    } catch {
      return { database: { status: 'down' } };
    }
  }
}
