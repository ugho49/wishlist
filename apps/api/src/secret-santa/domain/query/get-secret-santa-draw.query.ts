import type { AttendeeDto, EventId, ICurrentUser } from '@wishlist/common'

import { Query } from '@nestjs-architects/typed-cqrs'

export type GetSecretSantaDrawResult = AttendeeDto | undefined

export class GetSecretSantaDrawQuery extends Query<GetSecretSantaDrawResult> {
  public readonly currentUser: ICurrentUser
  public readonly eventId: EventId

  constructor(props: { currentUser: ICurrentUser; eventId: EventId }) {
    super()
    this.currentUser = props.currentUser
    this.eventId = props.eventId
  }
}
