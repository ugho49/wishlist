import { UserId, uuid, WishlistId } from '@wishlist/common'
import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryColumn, RelationId } from 'typeorm'

import { TimestampEntity } from '../../core/database'
import { EventEntity } from '../../event/infrastructure/legacy-event.entity'
import { ItemEntity } from '../../item/infrastructure/item.entity'
import { UserEntity } from '../../user'

@Entity('wishlist')
export class WishlistEntity extends TimestampEntity {
  @PrimaryColumn('uuid')
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

  @Column('uuid')
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
