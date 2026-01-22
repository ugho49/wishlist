import type { EventId, UserId, WishlistId } from '@wishlist/common'

import { Field, ObjectType } from '@nestjs/graphql'
import { createQueryResult, PagedResponse } from '@wishlist/api/core'

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

@ObjectType('WishlistPagedResponse')
export class GqlWishlistPagedResponse extends PagedResponse(GqlWishlist) {}

// Union types for queries (includes success type + auth rejection types)
export const GetWishlistByIdResult = createQueryResult('GetWishlistByIdResult', GqlWishlist)
export const GetMyWishlistsResult = createQueryResult('GetMyWishlistsResult', GqlWishlistPagedResponse)
