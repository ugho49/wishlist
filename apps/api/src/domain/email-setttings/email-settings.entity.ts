import { UserEmailSettingId, UserId } from '@wishlist/common-types'
import { TimestampEntity } from '@wishlist/nestjs/modules/database'
import { uuid } from '@wishlist/utils'
import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity('user_email_setting')
export class UserEmailSettingEntity extends TimestampEntity {
  @PrimaryColumn()
  id: UserEmailSettingId = uuid() as UserEmailSettingId

  @Column()
  userId: UserId

  @Column()
  dailyNewItemNotification: boolean = true

  public static create(props: { userId: UserId }): UserEmailSettingEntity {
    const entity = new UserEmailSettingEntity()
    entity.userId = props.userId
    return entity
  }
}
