import { Brand, uuid } from '@wishlist/common'

import { AttendeeId } from './attendee'
import { SecretSantaId } from './secret-santa'

export type SecretSantaUserId = Brand<string, 'SecretSantaUserId'>

export class SecretSantaUser {
  id: SecretSantaUserId
  secretSantaId: SecretSantaId
  drawUserId?: SecretSantaUserId
  attendeeId: AttendeeId
  exclusions: SecretSantaUserId[]
  createdAt: Date
  updatedAt: Date

  constructor(props: {
    id: SecretSantaUserId
    secretSantaId: SecretSantaId
    drawUserId?: SecretSantaUserId
    attendeeId: AttendeeId
    exclusions?: SecretSantaUserId[]
    createdAt?: Date
    updatedAt?: Date
  }) {
    this.id = props.id
    this.secretSantaId = props.secretSantaId
    this.drawUserId = props.drawUserId
    this.attendeeId = props.attendeeId
    this.exclusions = props.exclusions ?? []
    this.createdAt = props.createdAt ?? new Date()
    this.updatedAt = props.updatedAt ?? new Date()
  }

  static getNewId(): SecretSantaUserId {
    return uuid() as SecretSantaUserId
  }
}
