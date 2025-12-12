import type { EventId, UserId, WishlistId } from '@wishlist/common'

import { Field, ObjectType } from '@nestjs/graphql'
import { PagedResponse } from '@wishlist/api/core'

import { GqlItem } from '../../item/infrastructure/item.dto'

@ObjectType('WishlistConfig')
export class GqlWishlistConfig {
  @Field(() => Boolean)
  declare hideItems: boolean
}

@ObjectType('Wishlist')
export class GqlWishlist {
  @Field(() => String)
  declare id: WishlistId

  @Field(() => String)
  declare title: string

  @Field(() => String, { nullable: true })
  declare description?: string

  @Field(() => String, { nullable: true })
  declare logoUrl?: string

  @Field(() => String)
  declare ownerId: UserId

  @Field(() => String, { nullable: true })
  declare coOwnerId?: UserId

  @Field(() => [String])
  declare eventIds: EventId[]

  @Field(() => [GqlItem])
  declare items: GqlItem[]

  @Field(() => GqlWishlistConfig)
  declare config: GqlWishlistConfig

  @Field(() => String)
  declare createdAt: string

  @Field(() => String)
  declare updatedAt: string
}

@ObjectType()
export class GqlWishlistPagedResponse extends PagedResponse(GqlWishlist) {}
