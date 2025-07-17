import type { AttendeeId, SecretSantaId, SecretSantaUserId } from '@wishlist/common'

import { uuid } from '@wishlist/common'

export type SecretSantaUserProps = {
  id: SecretSantaUserId
  attendeeId: AttendeeId
  secretSantaId: SecretSantaId
  drawUserId?: SecretSantaUserId
  exclusions: SecretSantaUserId[]
  createdAt: Date
  updatedAt: Date
}

export class SecretSantaUser {
  public readonly id: SecretSantaUserId
  public readonly attendeeId: AttendeeId
  public readonly secretSantaId: SecretSantaId
  public readonly drawUserId?: SecretSantaUserId
  public readonly exclusions: SecretSantaUserId[]
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(props: SecretSantaUserProps) {
    this.id = props.id
    this.attendeeId = props.attendeeId
    this.secretSantaId = props.secretSantaId
    this.drawUserId = props.drawUserId
    this.exclusions = props.exclusions
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static create(props: { attendeeId: AttendeeId; secretSantaId: SecretSantaId }): SecretSantaUser {
    const now = new Date()
    return new SecretSantaUser({
      id: uuid() as SecretSantaUserId,
      attendeeId: props.attendeeId,
      secretSantaId: props.secretSantaId,
      exclusions: [],
      createdAt: now,
      updatedAt: now,
    })
  }

  hasDrawnUser(): boolean {
    return this.drawUserId !== undefined
  }

  isExcluded(userId: SecretSantaUserId): boolean {
    return this.exclusions.includes(userId)
  }

  canDrawUser(targetUserId: SecretSantaUserId): boolean {
    return targetUserId !== this.id && !this.isExcluded(targetUserId)
  }

  assignDraw(drawUserId: SecretSantaUserId): SecretSantaUser {
    if (!this.canDrawUser(drawUserId)) {
      throw new Error('Cannot draw this user')
    }

    return new SecretSantaUser({
      ...this,
      drawUserId,
      updatedAt: new Date(),
    })
  }

  addExclusion(userId: SecretSantaUserId): SecretSantaUser {
    if (userId === this.id) {
      throw new Error('Cannot exclude self')
    }

    if (this.isExcluded(userId)) {
      return this
    }

    return new SecretSantaUser({
      ...this,
      exclusions: [...this.exclusions, userId],
      updatedAt: new Date(),
    })
  }

  removeExclusion(userId: SecretSantaUserId): SecretSantaUser {
    return new SecretSantaUser({
      ...this,
      exclusions: this.exclusions.filter(id => id !== userId),
      updatedAt: new Date(),
    })
  }

  updateExclusions(exclusions: SecretSantaUserId[]): SecretSantaUser {
    const validExclusions = exclusions.filter(id => id !== this.id)

    return new SecretSantaUser({
      ...this,
      exclusions: validExclusions,
      updatedAt: new Date(),
    })
  }

  resetDraw(): SecretSantaUser {
    return new SecretSantaUser({
      ...this,
      drawUserId: undefined,
      updatedAt: new Date(),
    })
  }
}
