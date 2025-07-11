import { uuid } from '@wishlist/common'
import { UserEmailSettingId, UserId } from '@wishlist/common-types'
import { TimestampEntity } from 'apps/api/src/common/database'
import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity('user_email_setting')
export class UserEmailSettingEntity extends TimestampEntity {
  @PrimaryColumn()
  id: UserEmailSettingId = uuid() as UserEmailSettingId

  @Column()
  userId!: UserId

  @Column()
  dailyNewItemNotification: boolean = true

  public static create(props: { userId: UserId }): UserEmailSettingEntity {
    const entity = new UserEmailSettingEntity()
    entity.userId = props.userId
    return entity
  }
}
