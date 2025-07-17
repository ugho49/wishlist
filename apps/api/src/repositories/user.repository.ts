import { Injectable } from '@nestjs/common'
import { Authorities } from '@wishlist/common'

import * as schema from '../../drizzle/schema'
import { DatabaseService } from '../core/database'
import { User } from '../user/domain/user.model'
import { UserRepository } from '../user/domain/user.repository'

@Injectable()
export class PostgresUserRepository implements UserRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  static toModel(row: typeof schema.user.$inferSelect): User {
    return new User({
      id: row.id,
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName,
      birthday: row.birthday ? new Date(row.birthday) : undefined,
      passwordEnc: row.passwordEnc ?? undefined,
      isEnabled: row.isEnabled,
      authorities: row.authorities as Authorities[],
      lastIp: row.lastIp ?? undefined,
      lastConnectedAt: row.lastConnectedAt ? new Date(row.lastConnectedAt) : undefined,
      pictureUrl: row.pictureUrl ?? undefined,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    })
  }
}
