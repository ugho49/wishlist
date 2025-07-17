import { Injectable, NotFoundException } from '@nestjs/common'
import { Authorities, UserId } from '@wishlist/common'
import { eq } from 'drizzle-orm'

import * as schema from '../../drizzle/schema'
import { DatabaseService } from '../core/database'
import { User } from '../user/domain/user.model'
import { UserRepository } from '../user/domain/user.repository'

@Injectable()
export class PostgresUserRepository implements UserRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findById(id: UserId): Promise<User | undefined> {
    const user = await this.databaseService.db.query.user.findFirst({ where: eq(schema.user.id, id) })
    return user ? PostgresUserRepository.toModel(user) : undefined
  }

  async findByIdOrFail(id: UserId): Promise<User> {
    const user = await this.findById(id)
    if (!user) throw new NotFoundException('User not found')
    return user
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.databaseService.db.query.user.findFirst({ where: eq(schema.user.email, email) })
    return user ? PostgresUserRepository.toModel(user) : undefined
  }

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
      lastConnectedAt: row.lastConnectedAt ?? undefined,
      pictureUrl: row.pictureUrl ?? undefined,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    })
  }
}
