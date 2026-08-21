import { Injectable } from '@nestjs/common'

import { DatabaseService, type DrizzleDatabase } from './database.service'

export type DrizzleTransaction = Parameters<Parameters<DrizzleDatabase['transaction']>[0]>[0]

@Injectable()
export class TransactionManager {
  constructor(private readonly databaseService: DatabaseService) {}

  async runInTransaction<T>(callback: (tx: DrizzleTransaction) => Promise<T>): Promise<T> {
    return await this.databaseService.db.transaction(callback)
  }
}
