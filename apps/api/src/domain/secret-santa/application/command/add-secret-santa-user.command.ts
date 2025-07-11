import type { AttendeeId, SecretSantaId, SecretSantaUserDto, UserId } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

export class AddSecretSantaUserCommand extends Command<AddSecretSantaUserResult> {
  public readonly userId: UserId
  public readonly secretSantaId: SecretSantaId
  public readonly attendeeIds: AttendeeId[]

  constructor(props: { userId: UserId; secretSantaId: SecretSantaId; attendeeIds: AttendeeId[] }) {
    super()
    this.userId = props.userId
    this.secretSantaId = props.secretSantaId
    this.attendeeIds = props.attendeeIds
  }
}

export type AddSecretSantaUserResult = {
  users: SecretSantaUserDto[]
}
