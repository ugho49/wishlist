import { Injectable } from '@nestjs/common'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

import { DatabaseService, mergedSchema } from './database.service'

export type DrizzleTransaction = NodePgDatabase<typeof mergedSchema>

@Injectable()
export class TransactionManager {
  constructor(private readonly databaseService: DatabaseService) {}

  async runInTransaction<T>(callback: (tx: DrizzleTransaction) => Promise<T>): Promise<T> {
    return await this.databaseService.db.transaction(callback)
  }
}
