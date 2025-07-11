import { Inject, Injectable } from '@nestjs/common'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

import * as drizzleSchema from '../../../drizzle/schema'
import { DRIZZLE_DB } from './database.constant'

@Injectable()
export class DatabaseService {
  public readonly schema: typeof drizzleSchema = drizzleSchema

  constructor(@Inject(DRIZZLE_DB) public readonly client: NodePgDatabase<typeof drizzleSchema>) {}
}
