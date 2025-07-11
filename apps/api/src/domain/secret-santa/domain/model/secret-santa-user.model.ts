import type { AttendeeId, SecretSantaUserId } from '@wishlist/common'

export type SecretSantaUserModelProps = {
  id: SecretSantaUserId
  attendeeId: AttendeeId
  drawUser?: SecretSantaUserModel
  exclusions?: SecretSantaUserModel[]
}

export class SecretSantaUserModel {
  public readonly id: SecretSantaUserId
  public readonly attendeeId: AttendeeId
  public readonly drawUser?: SecretSantaUserModel
  public readonly exclusions?: SecretSantaUserModel[]

  constructor(props: SecretSantaUserModelProps) {
    this.id = props.id
    this.attendeeId = props.attendeeId
    this.drawUser = props.drawUser
    this.exclusions = props.exclusions
  }
}
