import type { ItemId, UserId } from '@wishlist/common'

import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType('Item')
export class GqlItem {
  @Field(() => String)
  declare id: ItemId

  @Field(() => String)
  declare name: string

  @Field(() => String, { nullable: true })
  declare description?: string

  @Field(() => String, { nullable: true })
  declare url?: string

  @Field(() => Number, { nullable: true })
  declare score?: number

  @Field(() => Boolean, { nullable: true })
  declare isSuggested?: boolean

  @Field(() => String, { nullable: true })
  declare pictureUrl?: string

  @Field(() => String, { nullable: true })
  declare takenById?: UserId

  @Field(() => String, { nullable: true })
  declare takenAt?: string

  @Field(() => String)
  declare createdAt: string
}
