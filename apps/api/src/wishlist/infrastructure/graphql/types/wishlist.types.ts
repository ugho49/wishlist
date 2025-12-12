import { Field, ID, Int, ObjectType } from '@nestjs/graphql'

import { MiniEventObject } from '../../../../event/infrastructure/graphql'
import { MiniUserObject } from '../../../../user/infrastructure/graphql'

@ObjectType('WishlistConfig')
export class WishlistConfigObject {
  @Field()
  hideItems!: boolean
}

@ObjectType('MiniWishlist')
export class MiniWishlistObject {
  @Field(() => ID)
  id!: string

  @Field()
  title!: string

  @Field({ nullable: true })
  description?: string

  @Field({ nullable: true })
  logoUrl?: string
}

@ObjectType('WishlistWithOwner')
export class WishlistWithOwnerObject extends MiniWishlistObject {
  @Field(() => MiniUserObject)
  owner!: MiniUserObject

  @Field(() => MiniUserObject, { nullable: true })
  coOwner?: MiniUserObject

  @Field(() => WishlistConfigObject)
  config!: WishlistConfigObject

  @Field()
  createdAt!: string

  @Field()
  updatedAt!: string
}

@ObjectType('WishlistWithEvents')
export class WishlistWithEventsObject extends WishlistWithOwnerObject {
  @Field(() => [MiniEventObject])
  events!: MiniEventObject[]
}

@ObjectType('DetailedWishlist')
export class DetailedWishlistObject extends MiniWishlistObject {
  @Field(() => MiniUserObject)
  owner!: MiniUserObject

  @Field(() => MiniUserObject, { nullable: true })
  coOwner?: MiniUserObject

  @Field(() => [MiniEventObject])
  events!: MiniEventObject[]

  @Field(() => WishlistConfigObject)
  config!: WishlistConfigObject

  @Field()
  createdAt!: string

  @Field()
  updatedAt!: string
}

@ObjectType('WishlistsPage')
export class WishlistsPageObject {
  @Field(() => [WishlistWithEventsObject])
  resources!: WishlistWithEventsObject[]

  @Field(() => Int)
  totalElements!: number

  @Field(() => Int)
  totalPages!: number

  @Field(() => Int)
  currentPage!: number

  @Field(() => Int)
  pageSize!: number

  @Field()
  isLastPage!: boolean
}

@ObjectType('UpdateWishlistLogoResult')
export class UpdateWishlistLogoResultObject {
  @Field()
  logoUrl!: string
}
