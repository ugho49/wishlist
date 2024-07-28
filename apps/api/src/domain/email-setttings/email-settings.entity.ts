import { uuid } from '@wishlist/common'
import { TimestampEntity } from '@wishlist/common-database'
import { Column, Entity, PrimaryColumn } from 'typeorm'

@Entity('user_email_setting')
export class UserEmailSettingEntity extends TimestampEntity {
  @PrimaryColumn()
  id: string = uuid()

  @Column()
  userId: string

  @Column()
  dailyNewItemNotification: boolean = true

  public static create(props: { userId: string }): UserEmailSettingEntity {
    const entity = new UserEmailSettingEntity()
    entity.userId = props.userId
    return entity
  }
}
