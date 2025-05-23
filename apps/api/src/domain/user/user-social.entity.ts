import type { UserId, UserSocialId } from '@wishlist/common-types'

import { uuid } from '@wishlist/common'
import { TimestampEntity } from '@wishlist/common-database'
import { UserSocialType } from '@wishlist/common-types'
import { Column, Entity, ManyToOne, PrimaryColumn, RelationId } from 'typeorm'

import { UserEntity } from './user.entity'

@Entity('user_social')
export class UserSocialEntity extends TimestampEntity {
  @PrimaryColumn()
  id: UserSocialId = uuid() as UserSocialId

  @ManyToOne(() => UserEntity, { lazy: true })
  readonly user!: Promise<UserEntity>

  @Column()
  @RelationId((entity: UserSocialEntity) => entity.user)
  userId!: UserId

  @Column()
  socialId!: string

  @Column()
  socialType!: UserSocialType

  @Column({ type: 'varchar', nullable: true })
  pictureUrl?: string | null

  public static create(props: {
    userId: UserId
    socialId: string
    socialType: UserSocialType
    pictureUrl?: string
  }): UserSocialEntity {
    const entity = new UserSocialEntity()
    entity.userId = props.userId
    entity.socialId = props.socialId
    entity.socialType = props.socialType
    entity.pictureUrl = props.pictureUrl
    return entity
  }
}
