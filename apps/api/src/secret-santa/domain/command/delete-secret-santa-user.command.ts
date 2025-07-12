import type { ICurrentUser, SecretSantaId, SecretSantaUserId } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

export class DeleteSecretSantaUserCommand extends Command<void> {
  public readonly currentUser: ICurrentUser
  public readonly secretSantaId: SecretSantaId
  public readonly secretSantaUserId: SecretSantaUserId

  constructor(props: {
    currentUser: ICurrentUser
    secretSantaId: SecretSantaId
    secretSantaUserId: SecretSantaUserId
  }) {
    super()
    this.currentUser = props.currentUser
    this.secretSantaId = props.secretSantaId
    this.secretSantaUserId = props.secretSantaUserId
  }
}
