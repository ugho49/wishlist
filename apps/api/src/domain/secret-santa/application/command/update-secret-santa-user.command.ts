import type { SecretSantaId, SecretSantaUserId, UserId } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

export class UpdateSecretSantaUserCommand extends Command<void> {
  public readonly userId: UserId
  public readonly secretSantaId: SecretSantaId
  public readonly secretSantaUserId: SecretSantaUserId
  public readonly exclusions: SecretSantaUserId[]

  constructor(props: {
    userId: UserId
    secretSantaId: SecretSantaId
    secretSantaUserId: SecretSantaUserId
    exclusions: SecretSantaUserId[]
  }) {
    super()
    this.userId = props.userId
    this.secretSantaId = props.secretSantaId
    this.secretSantaUserId = props.secretSantaUserId
    this.exclusions = props.exclusions
  }
}
