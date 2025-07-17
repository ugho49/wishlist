import type { ICurrentUser, SecretSantaId } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

export class DeleteSecretSantaCommand extends Command<void> {
  public readonly currentUser: ICurrentUser
  public readonly secretSantaId: SecretSantaId

  constructor(props: { currentUser: ICurrentUser; secretSantaId: SecretSantaId }) {
    super()
    this.currentUser = props.currentUser
    this.secretSantaId = props.secretSantaId
  }
}
