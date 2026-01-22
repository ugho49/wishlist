import { Injectable } from '@nestjs/common'
import { DatabaseService, DrizzleTransaction } from '@wishlist/api/core'
import { UserSocial, UserSocialRepository } from '@wishlist/api/user'
import { schema } from '@wishlist/api-drizzle'
import { UserId, UserSocialId, UserSocialType, uuid } from '@wishlist/common'
import { and, eq, inArray } from 'drizzle-orm'

import { PostgresUserRepository } from './postgres-user.repository'

@Injectable()
export class PostgresUserSocialRepository implements UserSocialRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  newId(): UserSocialId {
    return uuid() as UserSocialId
  }

  async findBySocialId(socialId: string, socialType: UserSocialType): Promise<UserSocial | undefined> {
    const userSocial = await this.databaseService.db.query.userSocial.findFirst({
      where: and(eq(schema.userSocial.socialId, socialId), eq(schema.userSocial.socialType, socialType)),
      with: { user: true },
    })

    return userSocial ? PostgresUserSocialRepository.toModel(userSocial) : undefined
  }

  async findByUserId(userId: UserId): Promise<UserSocial[]> {
    const userSocials = await this.databaseService.db.query.userSocial.findMany({
      where: eq(schema.userSocial.userId, userId),
      with: { user: true },
    })

    return userSocials.map(userSocial => PostgresUserSocialRepository.toModel(userSocial))
  }

  async findByUserIds(userIds: UserId[]): Promise<UserSocial[]> {
    const userSocials = await this.databaseService.db.query.userSocial.findMany({
      where: inArray(schema.userSocial.userId, userIds),
      with: { user: true },
    })

    return userSocials.map(userSocial => PostgresUserSocialRepository.toModel(userSocial))
  }

  async save(userSocial: UserSocial, tx?: DrizzleTransaction): Promise<void> {
    const client = tx ?? this.databaseService.db

    await client
      .insert(schema.userSocial)
      .values({
        id: userSocial.id,
        email: userSocial.email,
        name: userSocial.name,
        userId: userSocial.user.id,
        socialId: userSocial.socialId,
        socialType: userSocial.socialType,
        pictureUrl: userSocial.pictureUrl,
        createdAt: userSocial.createdAt,
        updatedAt: userSocial.updatedAt,
      })
      .onConflictDoUpdate({
        target: [schema.userSocial.socialId, schema.userSocial.socialType],
        set: {
          pictureUrl: userSocial.pictureUrl,
          email: userSocial.email,
          name: userSocial.name,
          updatedAt: userSocial.updatedAt,
        },
      })
  }

  async delete(id: UserSocialId, tx?: DrizzleTransaction): Promise<void> {
    const client = tx ?? this.databaseService.db

    await client.delete(schema.userSocial).where(eq(schema.userSocial.id, id))
  }

  static toModel(row: typeof schema.userSocial.$inferSelect & { user: typeof schema.user.$inferSelect }): UserSocial {
    return new UserSocial({
      id: row.id,
      user: PostgresUserRepository.toModel(row.user),
      email: row.email,
      name: row.name ?? undefined,
      socialId: row.socialId,
      socialType: row.socialType as UserSocialType,
      pictureUrl: row.pictureUrl ?? undefined,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    })
  }
}
