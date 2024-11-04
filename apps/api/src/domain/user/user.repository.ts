import { Inject, Injectable } from '@nestjs/common'
import { Database, DATABASE, UserTable } from '@wishlist/common-database'
import { User, UserId } from '@wishlist/domain'
import { Updateable } from 'kysely'
import { jsonArrayFrom } from 'kysely/helpers/postgres'

import { UserMapper } from './user.mapper'

@Injectable()
export class UserRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findById(id: UserId): Promise<User | undefined> {
    const entity = await this.getSelectQueryBuilder().where('id', '=', id).executeTakeFirst()

    return entity ? UserMapper.toDomain(entity) : undefined
  }

  async findByIdOrFail(id: UserId): Promise<User> {
    const entity = await this.findById(id)
    if (!entity) throw new Error(`User with id ${id} not found`)
    return entity
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const entity = await this.getSelectQueryBuilder().where('email', '=', email).executeTakeFirst()

    return entity ? UserMapper.toDomain(entity) : undefined
  }

  async findByEmails(emails: string[]): Promise<User[]> {
    const users = await this.getSelectQueryBuilder().where('email', 'in', emails).execute()
    return users.map(UserMapper.toDomain)
  }

  async searchByKeyword(param: { userId: UserId; keyword: string }): Promise<User[]> {
    const searchKey = param.keyword.trim().toLowerCase().normalize('NFC')

    const entities = await this.getSelectQueryBuilder()
      .where('id', '!=', param.userId)
      .where(eb =>
        eb.or([
          eb('first_name', 'ilike', `%${searchKey}%`),
          eb('last_name', 'ilike', `%${searchKey}%`),
          eb('email', 'ilike', `%${searchKey}%`),
        ]),
      )
      .limit(10)
      .orderBy('first_name', 'asc')
      .execute()

    return entities.map(UserMapper.toDomain)
  }

  async findAllByCriteriaPaginated(params: {
    take: number
    skip: number
    criteria?: string
  }): Promise<{ users: User[]; total: number }> {
    const { criteria, take, skip } = params

    let query = this.getSelectQueryBuilder().orderBy('created_at', 'desc').limit(take).offset(skip)
    let countQuery = this.db
      .selectFrom('user')
      .select(({ fn }) => [fn.count<number>('id').as('total')])
      .orderBy('created_at', 'desc')

    if (criteria) {
      const searchKey = criteria.trim().toLowerCase().normalize('NFC')
      query = query.where(eb =>
        eb.or([
          eb('first_name', 'ilike', `%${searchKey}%`),
          eb('last_name', 'ilike', `%${searchKey}%`),
          eb('email', 'ilike', `%${searchKey}%`),
        ]),
      )
      countQuery = countQuery.where(eb =>
        eb.or([
          eb('first_name', 'ilike', `%${searchKey}%`),
          eb('last_name', 'ilike', `%${searchKey}%`),
          eb('email', 'ilike', `%${searchKey}%`),
        ]),
      )
    }

    const users = await query.execute()
    const total = await countQuery.executeTakeFirst()

    return { users: users.map(UserMapper.toDomain), total: total?.total ?? 0 }
  }

  async update(id: UserId, partialUser: Updateable<UserTable>): Promise<void> {
    await this.db
      .updateTable('user')
      .set({ ...partialUser, updated_at: new Date() })
      .where('id', '=', id)
      .execute()
  }

  private getSelectQueryBuilder() {
    return this.db
      .selectFrom('user')
      .selectAll()
      .select(eb => [
        jsonArrayFrom(
          eb.selectFrom('user_social').selectAll('user_social').whereRef('user_id', '=', 'user_social.user_id'),
        ).as('socials'),
      ])
  }

  async delete(id: UserId) {
    await this.db.deleteFrom('user').where('id', '=', id).execute()
  }

  existByEmail(email: string): Promise<boolean> {
    return this.db
      .selectFrom('user')
      .select('id')
      .where('email', '=', email)
      .executeTakeFirst()
      .then(value => !!value)
  }
}
