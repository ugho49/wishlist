import type { SecretSantaId, UserId } from '@wishlist/common-types'

import { Command } from '@nestjs-architects/typed-cqrs'

export class UpdateSecretSantaCommand extends Command<void> {
  public readonly userId: UserId
  public readonly secretSantaId: SecretSantaId
  public readonly description?: string
  public readonly budget?: number

  constructor(props: { userId: UserId; secretSantaId: SecretSantaId; description?: string; budget?: number }) {
    super()
    this.userId = props.userId
    this.secretSantaId = props.secretSantaId
    this.description = props.description
    this.budget = props.budget
  }
}
