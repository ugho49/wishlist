import type { SecretSantaId, UserId } from '@wishlist/common-types'

import { Command } from '@nestjs-architects/typed-cqrs'

export class DeleteSecretSantaCommand extends Command<void> {
  public readonly userId: UserId
  public readonly secretSantaId: SecretSantaId

  constructor(props: { userId: UserId; secretSantaId: SecretSantaId }) {
    super()
    this.userId = props.userId
    this.secretSantaId = props.secretSantaId
  }
}
