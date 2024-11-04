import { Inject, Injectable } from '@nestjs/common'
import { Database, DATABASE, UserEmailSettingTable } from '@wishlist/common-database'
import { UserEmailSettingId, UserEmailSettings, UserId } from '@wishlist/domain'
import { Updateable } from 'kysely'

import { UserEmailSettingsMapper } from './email-settings.mapper'

@Injectable()
export class EmailSettingsRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findByUserId(userId: UserId): Promise<UserEmailSettings | undefined> {
    const entity = await this.db
      .selectFrom('user_email_setting')
      .selectAll()
      .where('user_id', '=', userId)
      .executeTakeFirst()

    return entity ? UserEmailSettingsMapper.toDomain(entity) : undefined
  }

  async insert(entity: UserEmailSettings) {
    await this.db.insertInto('user_email_setting').values(UserEmailSettingsMapper.toInsertable(entity)).execute()
  }

  async update(id: UserEmailSettingId, body: Updateable<UserEmailSettingTable>) {
    await this.db
      .updateTable('user_email_setting')
      .set({ ...body, updated_at: new Date() })
      .where('id', '=', id)
      .execute()
  }
}
