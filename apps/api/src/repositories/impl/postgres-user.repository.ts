import { Injectable, NotFoundException } from '@nestjs/common'
import { DatabaseService, DEFAULT_RESULT_NUMBER, type DrizzleTransaction } from '@wishlist/api/core'
import { User, type UserRepository } from '@wishlist/api/user'
import { schema } from '@wishlist/api-drizzle'
import { type Authorities, type UserId, uuid } from '@wishlist/common'
import { and, asc, count, desc, eq, inArray, like, ne, or, type SQL, sql } from 'drizzle-orm'

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

  async findAllByCriteria(params: { criteria: string; ignoreUserId?: UserId; limit?: number }): Promise<User[]> {
    const { criteria, ignoreUserId, limit } = params

    const searchKey = criteria.trim().toLowerCase().normalize('NFC')

    const users = await this.databaseService.db.query.user.findMany({
      where: and(
        ignoreUserId ? ne(schema.user.id, ignoreUserId) : undefined,
        or(
          like(sql`lower(${schema.user.firstName})`, `%${searchKey}%`),
          like(sql`lower(${schema.user.lastName})`, `%${searchKey}%`),
          like(sql`lower(${schema.user.email})`, `%${searchKey}%`),
        ),
      ),
      limit: limit ?? DEFAULT_RESULT_NUMBER,
      orderBy: [asc(schema.user.firstName)],
    })

    return users.map(user => PostgresUserRepository.toModel(user))
  }

  async findAllPaginated(params: {
    criteria?: string
    pagination: { take: number; skip: number }
  }): Promise<{ users: User[]; totalCount: number }> {
    let whereCondition: SQL | undefined

    if (params.criteria) {
      const searchKey = params.criteria.trim().toLowerCase().normalize('NFC')

      whereCondition = or(
        like(sql`lower(${schema.user.firstName})`, `%${searchKey}%`),
        like(sql`lower(${schema.user.lastName})`, `%${searchKey}%`),
        like(sql`lower(${schema.user.email})`, `%${searchKey}%`),
      )
    }

    // Get total count
    const totalCountResult = await this.databaseService.db
      .select({ count: count() })
      .from(schema.user)
      .where(whereCondition)

    const totalCount = totalCountResult[0]?.count ?? 0

    if (totalCount === 0) return { users: [], totalCount }

    const users = await this.databaseService.db.query.user.findMany({
      where: whereCondition,
      limit: params.pagination.take,
      offset: params.pagination.skip,
      orderBy: [desc(schema.user.createdAt)],
    })

    return { users: users.map(user => PostgresUserRepository.toModel(user)), totalCount }
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

  async delete(userId: UserId): Promise<void> {
    await this.databaseService.db.delete(schema.user).where(eq(schema.user.id, userId))
  }

  async findClosestFriends(userId: UserId, limit: number): Promise<User[]> {
    const userEventsSubquery = this.databaseService.db
      .select({ eventId: schema.eventAttendee.eventId })
      .from(schema.eventAttendee)
      .where(eq(schema.eventAttendee.userId, userId))

    const result = await this.databaseService.db
      .select({
        user: schema.user,
        commonEventsCount: count().as('common_events_count'),
      })
      .from(schema.user)
      .innerJoin(schema.eventAttendee, eq(schema.user.id, schema.eventAttendee.userId))
      .where(and(ne(schema.user.id, userId), inArray(schema.eventAttendee.eventId, userEventsSubquery)))
      .groupBy(schema.user.id)
      .orderBy(desc(count()))
      .limit(limit)

    return result.map(row => PostgresUserRepository.toModel(row.user))
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
