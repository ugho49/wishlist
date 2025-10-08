import { Field, InputType, Int } from '@nestjs/graphql'

@InputType()
export class GetMyWishlistsInput {
  @Field(() => Int, { defaultValue: 1 })
  declare page: number
}
