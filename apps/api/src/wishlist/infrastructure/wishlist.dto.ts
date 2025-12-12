import type { EventId, UserId, WishlistId } from '@wishlist/common'

import { Field, ObjectType } from '@nestjs/graphql'
import { PagedResponse } from '@wishlist/api/core'

import { ItemOutput } from '../../item/infrastructure/item.dto'

@ObjectType()
export class WishlistConfigOutput {
  @Field(() => Boolean)
  declare hideItems: boolean
}

@ObjectType()
export class WishlistOutput {
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

  @Field(() => [ItemOutput])
  declare items: ItemOutput[]

  @Field(() => WishlistConfigOutput)
  declare config: WishlistConfigOutput

  @Field(() => String)
  declare createdAt: string

  @Field(() => String)
  declare updatedAt: string
}

@ObjectType()
export class WishlistOutputPagedResponse extends PagedResponse(WishlistOutput) {}
