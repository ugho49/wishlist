import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql'
import { PagedResponse, PaginationInput } from '@wishlist/api/core'
import { AttendeeId, AttendeeRole, EventId, UserId, WishlistId } from '@wishlist/common'

registerEnumType(AttendeeRole, { name: 'AttendeeRole' })

@ObjectType('Event')
export class GqlEvent {
  @Field(() => String)
  declare id: EventId

  @Field(() => String)
  declare title: string

  @Field(() => String, { nullable: true })
  declare description?: string

  @Field(() => String, { nullable: true })
  declare icon?: string

  @Field(() => String)
  declare eventDate: string

  @Field(() => [String])
  declare wishlistIds: WishlistId[]

  @Field(() => [String])
  declare attendeeIds: AttendeeId[]

  @Field(() => String)
  declare createdAt: string

  @Field(() => String)
  declare updatedAt: string
}

@ObjectType('EventAttendee')
export class GqlEventAttendee {
  @Field(() => String)
  declare id: AttendeeId

  @Field(() => String, { nullable: true })
  declare userId?: UserId

  @Field(() => String, { nullable: true })
  declare pendingEmail?: string

  @Field(() => AttendeeRole)
  declare role: AttendeeRole
}

@InputType('EventPaginationInput')
export class GqlEventPaginationInput extends PaginationInput {
  @Field(() => Boolean, { nullable: true })
  declare onlyFuture?: boolean
}

@ObjectType()
export class EventOutputPagedResponse extends PagedResponse(GqlEvent) {}
