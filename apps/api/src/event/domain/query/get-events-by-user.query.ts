import type { PagedResponse, UserId } from '@wishlist/common'
import type { Event } from '../model/event.model'

import { Query } from '@nestjs-architects/typed-cqrs'

export type GetEventsByUserResult = PagedResponse<Event>

export class GetEventsByUserQuery extends Query<GetEventsByUserResult> {
  public readonly userId: UserId
  public readonly pageNumber: number
  public readonly pageSize: number
  public readonly ignorePastEvents: boolean

  constructor(props: { userId: UserId; pageNumber: number; pageSize: number; ignorePastEvents: boolean }) {
    super()
    this.userId = props.userId
    this.pageNumber = props.pageNumber
    this.pageSize = props.pageSize
    this.ignorePastEvents = props.ignorePastEvents
  }
}
