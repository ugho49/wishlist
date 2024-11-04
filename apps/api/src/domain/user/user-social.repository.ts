import { Inject, Injectable } from '@nestjs/common'
import { Database, DATABASE, UserSocialTable } from '@wishlist/common-database'
import { UserSocial, UserSocialId, UserSocialType } from '@wishlist/domain'
import { Updateable } from 'kysely'

import { UserSocialMapper } from './user.mapper'

@Injectable()
export class UserSocialRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findBy(param: { socialId: string; socialType: UserSocialType }): Promise<UserSocial | undefined> {
    const entity = await this.db
      .selectFrom('user_social')
      .selectAll()
      .where('social_id', '=', param.socialId)
      .where('social_type', '=', param.socialType)
      .executeTakeFirst()

    return entity ? UserSocialMapper.toDomain(entity) : undefined
  }

  async insert(social: UserSocial): Promise<void> {
    await this.db.insertInto('user_social').values(UserSocialMapper.toInsertable(social)).execute()
  }

  async update(id: UserSocialId, body: Updateable<UserSocialTable>) {
    await this.db
      .updateTable('user_social')
      .set({ ...body, updated_at: new Date() })
      .where('id', '=', id)
      .execute()
  }
}
