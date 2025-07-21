import { Injectable, NotFoundException } from '@nestjs/common'
import { schema } from '@wishlist/api-drizzle'
import { DatabaseService, DrizzleTransaction } from '@wishlist/api/core'
import { User, UserRepository } from '@wishlist/api/user'
import { Authorities, UserId, uuid } from '@wishlist/common'
import { eq, inArray } from 'drizzle-orm'

@Injectable()
export class PostgresUserRepository implements UserRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  newId(): UserId {
    return uuid() as UserId
  }

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

  async findByEmails(emails: string[]): Promise<User[]> {
    const users = await this.databaseService.db.query.user.findMany({ where: inArray(schema.user.email, emails) })
    return users.map(user => PostgresUserRepository.toModel(user))
  }

  async save(user: User, tx?: DrizzleTransaction): Promise<void> {
    const client = tx ?? this.databaseService.db

    await client
      .insert(schema.user)
      .values({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        birthday: user.birthday?.toISOString(),
        passwordEnc: user.passwordEnc,
        isEnabled: user.isEnabled,
        authorities: user.authorities as Authorities[],
        lastIp: user.lastIp,
        lastConnectedAt: user.lastConnectedAt,
        pictureUrl: user.pictureUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .onConflictDoUpdate({
        target: [schema.user.id],
        set: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          birthday: user.birthday?.toISOString() ?? null,
          passwordEnc: user.passwordEnc,
          isEnabled: user.isEnabled,
          authorities: user.authorities as Authorities[],
          lastIp: user.lastIp,
          lastConnectedAt: user.lastConnectedAt,
          pictureUrl: user.pictureUrl ?? null,
          updatedAt: user.updatedAt,
        },
      })
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
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
