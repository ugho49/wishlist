import { UserId, UserPasswordVerificationId, uuid } from '@wishlist/common'
import { Column, Entity, ManyToOne, PrimaryColumn, RelationId } from 'typeorm'

import { TimestampEntity } from '../../core'
import { UserEntity } from './legacy-user.entity'

@Entity('user_password_verification')
export class PasswordVerificationEntity extends TimestampEntity {
  @PrimaryColumn('uuid')
  id: UserPasswordVerificationId = uuid() as UserPasswordVerificationId

  @ManyToOne(() => UserEntity)
  readonly user!: Promise<UserEntity>

  @Column('uuid')
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
