import { Field, ID, Int, ObjectType } from '@nestjs/graphql'
import { EventId, WishlistId } from '@wishlist/common'

@ObjectType('MiniEvent')
export class MiniEventType {
  @Field(() => ID)
  declare id: EventId

  @Field()
  declare title: string

  @Field({ nullable: true })
  declare description?: string

  @Field({ nullable: true })
  declare icon?: string

  @Field()
  declare event_date: string
}

@ObjectType('Pagination')
export class PaginationType {
  @Field(() => Int)
  declare totalPages: number

  @Field(() => Int)
  declare totalElements: number

  @Field(() => Int)
  declare pageNumber: number

  @Field(() => Int)
  declare pageSize: number
}

@ObjectType('PaginatedWishlist')
export class PaginatedWishlistType {
  @Field(() => [WishlistWithEventsType])
  declare data: WishlistWithEventsType[]

  @Field(() => PaginationType)
  declare pagination: PaginationType
}

@ObjectType('WishlistConfig')
export class WishlistConfigType {
  @Field()
  declare hide_items: boolean
}

@ObjectType('WishlistWithEvents')
export class WishlistWithEventsType {
  @Field(() => ID)
  declare id: WishlistId

  @Field()
  declare title: string

  @Field({ nullable: true })
  declare description?: string

  @Field({ nullable: true })
  declare logo_url?: string

  @Field(() => [MiniEventType])
  declare events: MiniEventType[]

  @Field(() => WishlistConfigType)
  declare config: WishlistConfigType

  @Field()
  declare created_at: string

  @Field()
  declare updated_at: string
}
