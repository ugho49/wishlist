import { Field, ID, InputType, Int } from '@nestjs/graphql'

@InputType()
export class CreateItemInput {
  @Field(() => ID)
  wishlistId!: string

  @Field()
  name!: string

  @Field({ nullable: true })
  description?: string

  @Field({ nullable: true })
  url?: string

  @Field(() => Int, { nullable: true })
  score?: number

  @Field({ nullable: true })
  pictureUrl?: string
}

@InputType()
export class UpdateItemInput {
  @Field()
  name!: string

  @Field({ nullable: true })
  description?: string

  @Field({ nullable: true })
  url?: string

  @Field(() => Int, { nullable: true })
  score?: number

  @Field({ nullable: true })
  pictureUrl?: string
}

@InputType()
export class ImportItemsInput {
  @Field(() => ID)
  wishlistId!: string

  @Field(() => [ID])
  sourceItemIds!: string[]
}

@InputType()
export class ScanItemUrlInput {
  @Field()
  url!: string
}
