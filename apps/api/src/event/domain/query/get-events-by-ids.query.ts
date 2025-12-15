import type { EventId, ICurrentUser } from '@wishlist/common'
import type { Event } from '../model/event.model'

import { Query } from '@nestjs-architects/typed-cqrs'

export class GetEventsByIdsQuery extends Query<Event[]> {
  public readonly currentUser: ICurrentUser
  public readonly eventIds: EventId[]

  constructor(props: { currentUser: ICurrentUser; eventIds: EventId[] }) {
    super()
    this.currentUser = props.currentUser
    this.eventIds = props.eventIds
  }
}
