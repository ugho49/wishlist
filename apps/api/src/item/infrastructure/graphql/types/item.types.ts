import { Field, ID, Int, ObjectType } from '@nestjs/graphql'

import { MiniUserObject } from '../../../../user/infrastructure/graphql'

@ObjectType('Item')
export class ItemObject {
  @Field(() => ID)
  id!: string

  @Field()
  name!: string

  @Field({ nullable: true })
  description?: string

  @Field({ nullable: true })
  url?: string

  @Field(() => Int, { nullable: true })
  score?: number

  @Field({ nullable: true })
  isSuggested?: boolean

  @Field({ nullable: true })
  pictureUrl?: string

  @Field(() => MiniUserObject, { nullable: true })
  takenBy?: MiniUserObject

  @Field({ nullable: true })
  takenAt?: string

  @Field()
  createdAt!: string
}

@ObjectType('ToggleItemResult')
export class ToggleItemResultObject {
  @Field(() => MiniUserObject, { nullable: true })
  takenBy?: MiniUserObject

  @Field({ nullable: true })
  takenAt?: string
}

@ObjectType('ScanItemResult')
export class ScanItemResultObject {
  @Field({ nullable: true })
  pictureUrl?: string
}
