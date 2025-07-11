import type { EventId, SecretSantaDto, UserId } from '@wishlist/common'

import { Query } from '@nestjs-architects/typed-cqrs'

export type GetSecretSantaResult = SecretSantaDto | undefined

export class GetSecretSantaQuery extends Query<GetSecretSantaResult> {
  public readonly userId: UserId
  public readonly eventId: EventId

  constructor(props: { userId: UserId; eventId: EventId }) {
    super()
    this.userId = props.userId
    this.eventId = props.eventId
  }
}
