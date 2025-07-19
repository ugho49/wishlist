import type { DetailedEventDto, EventId, ICurrentUser } from '@wishlist/common'

import { Query } from '@nestjs-architects/typed-cqrs'

export type GetEventByIdResult = DetailedEventDto

export class GetEventByIdQuery extends Query<GetEventByIdResult> {
  public readonly currentUser: ICurrentUser
  public readonly eventId: EventId

  constructor(props: { currentUser: ICurrentUser; eventId: EventId }) {
    super()
    this.currentUser = props.currentUser
    this.eventId = props.eventId
  }
}
