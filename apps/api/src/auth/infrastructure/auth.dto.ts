import { Field, InputType, ObjectType } from '@nestjs/graphql'
import { Transform } from 'class-transformer'
import { IsEmail, MaxLength } from 'class-validator'

@InputType()
export class LoginInput {
  @Field(() => String)
  @IsEmail()
  @MaxLength(200)
  @Transform(({ value }) => value.toLowerCase())
  declare email: string

  @Field(() => String)
  declare password: string
}

@ObjectType()
export class LoginOutput {
  @Field(() => String)
  declare accessToken: string
}

@InputType()
export class LoginWithGoogleInput {
  @Field(() => String)
  declare code: string

  @Field(() => Boolean)
  declare createUserIfNotExists: boolean
}

@ObjectType()
export class LoginWithGoogleOutput extends LoginOutput {
  @Field(() => Boolean, { nullable: true })
  declare newUserCreated?: boolean

  @Field(() => Boolean, { nullable: true })
  declare linkedToExistingUser?: boolean
}
