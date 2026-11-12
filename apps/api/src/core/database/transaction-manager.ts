import type { DrizzleDatabase } from './database.factory';

import { Injectable } from '@znight/core';

export type DrizzleTransaction = Parameters<Parameters<DrizzleDatabase['transaction']>[0]>[0];

@Injectable()
export class TransactionManager {
  constructor(private readonly db: DrizzleDatabase) {}

  async runInTransaction<T>(callback: (tx: DrizzleTransaction) => Promise<T>): Promise<T> {
    return await this.db.transaction(callback);
  }
}
