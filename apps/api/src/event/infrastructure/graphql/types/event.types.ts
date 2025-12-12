import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql'
import { AttendeeRole } from '@wishlist/common'

import { MiniUserObject } from '../../../../user/infrastructure/graphql'

// Register enum for GraphQL
registerEnumType(AttendeeRole, {
  name: 'AttendeeRole',
  description: 'Role of an attendee in an event',
})

@ObjectType('Attendee')
export class AttendeeObject {
  @Field(() => ID)
  id!: string

  @Field(() => MiniUserObject, { nullable: true })
  user?: MiniUserObject

  @Field({ nullable: true })
  pendingEmail?: string

  @Field(() => AttendeeRole)
  role!: AttendeeRole
}

@ObjectType('MiniEvent')
export class MiniEventObject {
  @Field(() => ID)
  id!: string

  @Field()
  title!: string

  @Field({ nullable: true })
  description?: string

  @Field({ nullable: true })
  icon?: string

  @Field()
  eventDate!: string
}

@ObjectType('EventWithCounts')
export class EventWithCountsObject extends MiniEventObject {
  @Field(() => Int)
  nbWishlists!: number

  @Field(() => [AttendeeObject])
  attendees!: AttendeeObject[]

  @Field()
  createdAt!: string

  @Field()
  updatedAt!: string
}

@ObjectType('DetailedEvent')
export class DetailedEventObject extends MiniEventObject {
  @Field(() => [AttendeeObject])
  attendees!: AttendeeObject[]

  @Field()
  createdAt!: string

  @Field()
  updatedAt!: string
}

@ObjectType('EventsPage')
export class EventsPageObject {
  @Field(() => [EventWithCountsObject])
  resources!: EventWithCountsObject[]

  @Field(() => Int)
  totalElements!: number

  @Field(() => Int)
  totalPages!: number

  @Field(() => Int)
  currentPage!: number

  @Field(() => Int)
  pageSize!: number

  @Field()
  isLastPage!: boolean
}
