import { ItemId, UserId, uuid, WishlistId } from '@wishlist/common'
import { Column, Entity, ManyToOne, PrimaryColumn, RelationId } from 'typeorm'

import { TimestampEntity } from '../../common'
import { UserEntity } from '../user'
import { WishlistEntity } from '../wishlist/wishlist.entity'

@Entity('item')
export class ItemEntity extends TimestampEntity {
  @PrimaryColumn()
  id: ItemId = uuid() as ItemId

  @Column()
  name!: string

  @Column({ type: 'varchar', nullable: true })
  description?: string | null

  @Column({ type: 'varchar', nullable: true })
  url?: string | null

  @Column({ type: 'varchar', nullable: true })
  pictureUrl?: string | null

  @Column()
  isSuggested!: boolean

  @Column({ type: 'integer', nullable: true })
  score?: number | null

  @Column({ type: 'timestamptz', nullable: true })
  takenAt?: Date | null

  @ManyToOne(() => WishlistEntity, { lazy: true })
  readonly wishlist!: Promise<WishlistEntity>

  @Column()
  @RelationId((entity: ItemEntity) => entity.wishlist)
  wishlistId!: WishlistId

  @ManyToOne(() => UserEntity, { lazy: true })
  readonly taker?: Promise<UserEntity> | null

  @Column({ nullable: true })
  @RelationId((entity: ItemEntity) => entity.taker)
  takerId?: UserId | null

  static create(param: {
    name: string
    wishlistId: WishlistId
    description?: string
    url?: string
    pictureUrl?: string
    isSuggested: boolean
    score?: number
  }): ItemEntity {
    const entity = new ItemEntity()
    entity.name = param.name
    entity.wishlistId = param.wishlistId
    entity.description = param.description
    entity.url = param.url
    entity.pictureUrl = param.pictureUrl
    entity.isSuggested = param.isSuggested
    entity.score = param.score
    return entity
  }

  isNotSuggested() {
    return !this.isSuggested
  }

  isTakenBySomeone() {
    return this.takerId !== undefined && this.takerId !== null
  }
}
