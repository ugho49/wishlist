import { Field, ID, InputType, Int } from '@nestjs/graphql'

@InputType()
export class CreateWishlistInput {
  @Field()
  title!: string

  @Field({ nullable: true })
  description?: string

  @Field({ nullable: true, defaultValue: false })
  hideItems?: boolean

  @Field(() => [ID])
  eventIds!: string[]
}

@InputType()
export class UpdateWishlistInput {
  @Field()
  title!: string

  @Field({ nullable: true })
  description?: string
}

@InputType()
export class GetWishlistsInput {
  @Field(() => Int, { defaultValue: 1 })
  page!: number

  @Field(() => Int, { defaultValue: 20 })
  limit!: number
}

@InputType()
export class LinkUnlinkWishlistInput {
  @Field(() => ID)
  eventId!: string
}

@InputType()
export class AddCoOwnerInput {
  @Field(() => ID)
  userId!: string
}
