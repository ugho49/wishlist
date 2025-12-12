import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql'
import { UserSocialType } from '@wishlist/common'

// Register enum for GraphQL
registerEnumType(UserSocialType, {
  name: 'UserSocialType',
  description: 'Type of social account linked to user',
})

@ObjectType('UserSocial')
export class UserSocialObject {
  @Field(() => ID)
  id!: string

  @Field()
  email!: string

  @Field({ nullable: true })
  name?: string

  @Field()
  socialId!: string

  @Field(() => UserSocialType)
  socialType!: UserSocialType

  @Field({ nullable: true })
  pictureUrl?: string

  @Field()
  createdAt!: string

  @Field()
  updatedAt!: string
}

@ObjectType('MiniUser')
export class MiniUserObject {
  @Field(() => ID)
  id!: string

  @Field()
  firstname!: string

  @Field()
  lastname!: string

  @Field()
  email!: string

  @Field({ nullable: true })
  pictureUrl?: string
}

@ObjectType('User')
export class UserObject extends MiniUserObject {
  @Field({ nullable: true })
  birthday?: string

  @Field()
  isAdmin!: boolean

  @Field()
  isEnabled!: boolean

  @Field({ nullable: true })
  lastConnectedAt?: string

  @Field(() => [UserSocialObject])
  socials!: UserSocialObject[]

  @Field()
  createdAt!: string

  @Field()
  updatedAt!: string
}

@ObjectType('UserEmailSettings')
export class UserEmailSettingsObject {
  @Field()
  dailyNewItemNotification!: boolean
}

@ObjectType('PendingEmailChange')
export class PendingEmailChangeObject {
  @Field()
  newEmail!: string

  @Field()
  expiredAt!: string
}

@ObjectType('UpdatePictureResult')
export class UpdatePictureResultObject {
  @Field()
  pictureUrl!: string
}

@ObjectType('UserSearchResult')
export class UserSearchResultObject {
  @Field(() => [MiniUserObject])
  users!: MiniUserObject[]
}
