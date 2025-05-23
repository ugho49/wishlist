import { uuid } from '@wishlist/common'
import { TimestampEntity } from '@wishlist/common-database'
import { UserId, WishlistId } from '@wishlist/common-types'
import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryColumn, RelationId } from 'typeorm'

import { EventEntity } from '../event/event.entity'
import { ItemEntity } from '../item/item.entity'
import { UserEntity } from '../user'

@Entity('wishlist')
export class WishlistEntity extends TimestampEntity {
  @PrimaryColumn()
  id: WishlistId = uuid() as WishlistId

  @Column()
  title!: string

  @Column({ type: 'varchar', nullable: true })
  description?: string | null

  @Column({ type: 'varchar', nullable: true })
  logoUrl?: string | null

  @Column()
  hideItems!: boolean

  @ManyToOne(() => UserEntity)
  readonly owner!: Promise<UserEntity>

  @Column()
  @RelationId((entity: WishlistEntity) => entity.owner)
  ownerId!: UserId

  @OneToMany(() => ItemEntity, item => item.wishlist, {
    cascade: true,
  })
  items!: Promise<ItemEntity[]>

  @ManyToMany(() => EventEntity, event => event.wishlists, {
    cascade: true,
  })
  events!: Promise<EventEntity[]>

  public static create(props: {
    title: string
    description?: string
    ownerId: UserId
    hideItems: boolean
  }): WishlistEntity {
    const entity = new WishlistEntity()
    entity.title = props.title
    entity.description = props.description
    entity.ownerId = props.ownerId
    entity.hideItems = props.hideItems
    return entity
  }
}
