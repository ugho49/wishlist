import { Field, InputType, Int } from '@nestjs/graphql'

@InputType()
export class RegisterUserInput {
  @Field()
  firstname!: string

  @Field()
  lastname!: string

  @Field()
  email!: string

  @Field()
  password!: string
}

@InputType()
export class UpdateUserProfileInput {
  @Field()
  firstname!: string

  @Field()
  lastname!: string

  @Field({ nullable: true })
  birthday?: string
}

@InputType()
export class ChangeUserPasswordInput {
  @Field()
  oldPassword!: string

  @Field()
  newPassword!: string
}

@InputType()
export class LinkUserToGoogleInput {
  @Field()
  code!: string
}

@InputType()
export class UpdateUserEmailSettingsInput {
  @Field()
  dailyNewItemNotification!: boolean
}

@InputType()
export class RequestEmailChangeInput {
  @Field()
  newEmail!: string
}

@InputType()
export class ConfirmEmailChangeInput {
  @Field()
  newEmail!: string

  @Field()
  token!: string
}

@InputType()
export class ResetPasswordInput {
  @Field()
  email!: string
}

@InputType()
export class ResetPasswordValidationInput {
  @Field()
  email!: string

  @Field()
  token!: string

  @Field()
  newPassword!: string
}

@InputType()
export class SearchUsersInput {
  @Field()
  keyword!: string
}

@InputType()
export class GetClosestFriendsInput {
  @Field(() => Int, { defaultValue: 10 })
  count!: number
}
