import type { EventId, ICurrentUser, SecretSantaDto } from '@wishlist/common'

import { Query } from '@nestjs-architects/typed-cqrs'

export type GetSecretSantaResult = SecretSantaDto | undefined

export class GetSecretSantaQuery extends Query<GetSecretSantaResult> {
  public readonly currentUser: ICurrentUser
  public readonly eventId: EventId

  constructor(props: { currentUser: ICurrentUser; eventId: EventId }) {
    super()
    this.currentUser = props.currentUser
    this.eventId = props.eventId
  }
}
