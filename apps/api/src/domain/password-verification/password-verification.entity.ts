import { uuid } from '@wishlist/common'
import { UserId, UserPasswordVerificationId } from '@wishlist/common-types'
import { TimestampEntity } from 'apps/api/src/common/database'
import { Column, Entity, ManyToOne, PrimaryColumn, RelationId } from 'typeorm'

import { UserEntity } from '../user'

@Entity('user_password_verification')
export class PasswordVerificationEntity extends TimestampEntity {
  @PrimaryColumn()
  id: UserPasswordVerificationId = uuid() as UserPasswordVerificationId

  @ManyToOne(() => UserEntity)
  readonly user!: Promise<UserEntity>

  @Column()
  @RelationId((entity: PasswordVerificationEntity) => entity.user)
  userId!: UserId

  @Column()
  token!: string

  @Column()
  expiredAt!: Date

  public static create(props: { user: UserId; token: string; expiredAt: Date }): PasswordVerificationEntity {
    const entity = new PasswordVerificationEntity()
    entity.userId = props.user
    entity.token = props.token
    entity.expiredAt = props.expiredAt
    return entity
  }
}
