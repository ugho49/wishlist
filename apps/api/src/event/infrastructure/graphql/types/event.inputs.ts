import { Field, InputType, Int } from '@nestjs/graphql'
import { AttendeeRole } from '@wishlist/common'

@InputType()
export class AddAttendeeInput {
  @Field()
  email!: string

  @Field(() => AttendeeRole, { nullable: true })
  role?: AttendeeRole
}

@InputType()
export class CreateEventInput {
  @Field()
  title!: string

  @Field({ nullable: true })
  description?: string

  @Field({ nullable: true })
  icon?: string

  @Field()
  eventDate!: string

  @Field(() => [AddAttendeeInput], { nullable: true })
  attendees?: AddAttendeeInput[]
}

@InputType()
export class UpdateEventInput {
  @Field()
  title!: string

  @Field({ nullable: true })
  description?: string

  @Field({ nullable: true })
  icon?: string

  @Field()
  eventDate!: string
}

@InputType()
export class GetEventsInput {
  @Field(() => Int, { defaultValue: 1 })
  page!: number

  @Field(() => Int, { defaultValue: 20 })
  limit!: number

  @Field({ defaultValue: false })
  onlyFuture!: boolean
}
