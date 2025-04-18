import type { AttendeeDto, EventId, UserId } from '@wishlist/common-types'

import { Query } from '@nestjs-architects/typed-cqrs'

export type GetSecretSantaDrawResult = AttendeeDto | undefined

export class GetSecretSantaDrawQuery extends Query<GetSecretSantaDrawResult> {
  public readonly userId: UserId
  public readonly eventId: EventId

  constructor(props: { userId: UserId; eventId: EventId }) {
    super()
    this.userId = props.userId
    this.eventId = props.eventId
  }
}
