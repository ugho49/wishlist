import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType('LoginResult')
export class LoginResultObject {
  @Field()
  accessToken!: string

  @Field({ nullable: true })
  newUserCreated?: boolean

  @Field({ nullable: true })
  linkedToExistingUser?: boolean
}
