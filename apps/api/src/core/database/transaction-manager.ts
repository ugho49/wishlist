import { Injectable } from '@nestjs/common'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

import * as drizzleSchema from '../../../drizzle/schema'
import { DatabaseService } from './database.service'

export type DrizzleTransaction = NodePgDatabase<typeof drizzleSchema>

@Injectable()
export class TransactionManager {
  constructor(private readonly databaseService: DatabaseService) {}

  async runInTransaction<T>(callback: (tx: DrizzleTransaction) => Promise<T>): Promise<T> {
    const { client } = this.databaseService
    return await client.transaction(callback)
  }
}
