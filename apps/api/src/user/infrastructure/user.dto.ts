import { Field, ObjectType } from '@nestjs/graphql'
import { UserId } from '@wishlist/common'

@ObjectType()
export class UserOutput {
  @Field(() => String)
  declare id: UserId

  @Field(() => String)
  declare firstName: string

  @Field(() => String)
  declare lastName: string

  @Field(() => String)
  declare email: string

  @Field(() => String, { nullable: true })
  declare pictureUrl?: string

  @Field(() => String, { nullable: true })
  declare birthday?: string

  @Field(() => Boolean)
  declare isEnabled: boolean

  @Field(() => String)
  declare createdAt: string

  @Field(() => String)
  declare updatedAt: string

  // ResolvedField
  // declare social: UserSocialDto[]
}

@ObjectType()
export class UserWithAdminPropsOutput extends UserOutput {
  @Field(() => Boolean)
  declare isAdmin: boolean

  @Field(() => String, { nullable: true })
  declare lastConnectedAt?: string

  @Field(() => String, { nullable: true })
  declare lastIp?: string
}
