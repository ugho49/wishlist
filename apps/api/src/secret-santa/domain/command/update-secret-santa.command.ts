import type { ICurrentUser, SecretSantaId } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

export class UpdateSecretSantaCommand extends Command<void> {
  public readonly currentUser: ICurrentUser
  public readonly secretSantaId: SecretSantaId
  public readonly description?: string
  public readonly budget?: number

  constructor(props: {
    currentUser: ICurrentUser
    secretSantaId: SecretSantaId
    description?: string
    budget?: number
  }) {
    super()
    this.currentUser = props.currentUser
    this.secretSantaId = props.secretSantaId
    this.description = props.description
    this.budget = props.budget
  }
}
