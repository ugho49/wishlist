import { Injectable } from '@nestjs/common';
import { type HealthIndicatorResult, HealthIndicatorService } from '@nestjs/terminus';

import { DatabaseService } from '../database/database.service';

@Injectable()
export class DatabaseHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly databaseService: DatabaseService,
  ) {}

  async pingCheck(): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check('database');

    try {
      await this.databaseService.ping();
      return indicator.up();
    } catch {
      return indicator.down();
    }
  }
}
