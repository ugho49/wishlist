import { Field, InputType } from '@nestjs/graphql'

@InputType()
export class LoginInput {
  @Field()
  email!: string

  @Field()
  password!: string
}

@InputType()
export class LoginWithGoogleInput {
  @Field()
  code!: string

  @Field()
  createUserIfNotExists!: boolean
}
