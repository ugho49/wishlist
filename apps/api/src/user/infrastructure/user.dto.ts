import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql'
import { createMutationResult, createQueryResult } from '@wishlist/api/core'
import { UserId, UserSocialId, UserSocialType } from '@wishlist/common'

registerEnumType(UserSocialType, { name: 'UserSocialType' })

@ObjectType('User')
export class GqlUser {
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
}

@ObjectType('UserWithAdminProps')
export class GqlUserWithAdmin extends GqlUser {
  @Field(() => Boolean)
  declare isAdmin: boolean

  @Field(() => String, { nullable: true })
  declare lastConnectedAt?: string

  @Field(() => String, { nullable: true })
  declare lastIp?: string
}

@ObjectType('UserSocial')
export class GqlUserSocial {
  @Field(() => String)
  declare id: UserSocialId

  @Field(() => String)
  declare email: string

  @Field(() => String, { nullable: true })
  declare name?: string

  @Field(() => String)
  declare socialType: UserSocialType

  @Field(() => String, { nullable: true })
  declare pictureUrl?: string

  @Field(() => String)
  declare createdAt: string

  @Field(() => String)
  declare updatedAt: string
}

@InputType('RegisterUserInput')
export class RegisterUserInput {
  @Field(() => String)
  declare firstname: string

  @Field(() => String)
  declare lastname: string

  @Field(() => String)
  declare email: string

  @Field(() => String)
  declare password: string

  @Field(() => String, { nullable: true })
  declare birthday?: Date
}

@InputType('LinkUserToGoogleInput')
export class LinkUserToGoogleInput {
  @Field(() => String)
  declare code: string
}

@InputType('UpdateUserInput')
export class UpdateUserInput {
  @Field(() => String)
  declare firstname: string

  @Field(() => String)
  declare lastname: string

  @Field(() => String, { nullable: true })
  declare birthday?: Date
}

// Union types for mutations (includes success type + rejection types)
export const RegisterUserResult = createMutationResult('RegisterUserResult', GqlUser)
export const UpdateUserResult = createMutationResult('UpdateUserResult', GqlUser)
export const LinkUserToGoogleResult = createMutationResult('LinkUserToGoogleResult', GqlUserSocial)

// Union types for queries (includes success type + auth rejection types)
export const GetCurrentUserResult = createQueryResult('GetCurrentUserResult', GqlUser)
