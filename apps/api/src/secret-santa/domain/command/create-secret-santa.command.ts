import type { EventId, ICurrentUser, SecretSantaDto } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

export class CreateSecretSantaCommand extends Command<CreateSecretSantaResult> {
  public readonly currentUser: ICurrentUser
  public readonly eventId: EventId
  public readonly description?: string
  public readonly budget?: number

  constructor(props: { currentUser: ICurrentUser; eventId: EventId; description?: string; budget?: number }) {
    super()
    this.currentUser = props.currentUser
    this.eventId = props.eventId
    this.description = props.description
    this.budget = props.budget
  }
}

export type CreateSecretSantaResult = SecretSantaDto
