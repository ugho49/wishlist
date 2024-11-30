import type { EventId, SecretSantaDto, UserId } from '@wishlist/common-types'

import { Command } from '@nestjs-architects/typed-cqrs'

export class CreateSecretSantaCommand extends Command<CreateSecretSantaResult> {
  public readonly userId: UserId
  public readonly eventId: EventId
  public readonly description?: string
  public readonly budget?: number

  constructor(props: { userId: UserId; eventId: EventId; description?: string; budget?: number }) {
    super()
    this.userId = props.userId
    this.eventId = props.eventId
    this.description = props.description
    this.budget = props.budget
  }
}

export type CreateSecretSantaResult = SecretSantaDto
