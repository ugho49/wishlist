import { Field, Float, ID, InputType } from '@nestjs/graphql'

@InputType()
export class CreateSecretSantaInput {
  @Field(() => ID)
  eventId!: string

  @Field({ nullable: true })
  description?: string

  @Field(() => Float, { nullable: true })
  budget?: number
}

@InputType()
export class UpdateSecretSantaInput {
  @Field({ nullable: true })
  description?: string

  @Field(() => Float, { nullable: true })
  budget?: number
}

@InputType()
export class AddSecretSantaUsersInput {
  @Field(() => [ID])
  attendeeIds!: string[]
}

@InputType()
export class UpdateSecretSantaUserInput {
  @Field(() => [ID])
  exclusions!: string[]
}
