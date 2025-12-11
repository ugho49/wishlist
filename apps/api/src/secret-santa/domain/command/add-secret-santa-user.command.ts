import type { AttendeeId, ICurrentUser, SecretSantaId, SecretSantaUserDto } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

export class AddSecretSantaUsersCommand extends Command<AddSecretSantaUsersResult> {
  public readonly currentUser: ICurrentUser
  public readonly secretSantaId: SecretSantaId
  public readonly attendeeIds: AttendeeId[]

  constructor(props: { currentUser: ICurrentUser; secretSantaId: SecretSantaId; attendeeIds: AttendeeId[] }) {
    super()
    this.currentUser = props.currentUser
    this.secretSantaId = props.secretSantaId
    this.attendeeIds = props.attendeeIds
  }
}

export type AddSecretSantaUsersResult = {
  users: SecretSantaUserDto[]
}
