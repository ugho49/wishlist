import type { SecretSantaId, SecretSantaUserId, UserId } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

export class DeleteSecretSantaUserCommand extends Command<void> {
  public readonly userId: UserId
  public readonly secretSantaId: SecretSantaId
  public readonly secretSantaUserId: SecretSantaUserId

  constructor(props: { userId: UserId; secretSantaId: SecretSantaId; secretSantaUserId: SecretSantaUserId }) {
    super()
    this.userId = props.userId
    this.secretSantaId = props.secretSantaId
    this.secretSantaUserId = props.secretSantaUserId
  }
}
