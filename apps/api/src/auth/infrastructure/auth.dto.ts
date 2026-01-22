import { Field, InputType, ObjectType } from '@nestjs/graphql'
import { createMutationResult } from '@wishlist/api/core'

@InputType()
export class LoginInput {
  @Field(() => String)
  declare email: string

  @Field(() => String)
  declare password: string
}

@InputType()
export class LoginWithGoogleInput {
  @Field(() => String)
  declare code: string

  @Field(() => Boolean)
  declare createUserIfNotExists: boolean
}

@ObjectType()
export class LoginOutput {
  @Field(() => String)
  declare accessToken: string
}

@ObjectType()
export class LoginWithGoogleOutput extends LoginOutput {
  @Field(() => Boolean, { nullable: true })
  declare newUserCreated?: boolean

  @Field(() => Boolean, { nullable: true })
  declare linkedToExistingUser?: boolean
}

// Union types for mutations (includes success type + rejection types)
export const LoginResult = createMutationResult('LoginResult', LoginOutput)
export const LoginWithGoogleResult = createMutationResult('LoginWithGoogleResult', LoginWithGoogleOutput)
