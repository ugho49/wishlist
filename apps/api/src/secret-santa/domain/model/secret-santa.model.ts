import type { AttendeeId, EventId, SecretSantaId, SecretSantaStatus, SecretSantaUserId } from '@wishlist/common'
import type { SecretSantaUser } from './secret-santa-user.model'

import { SecretSantaDrawService, SecretSantaStatus as Status } from '@wishlist/common'

export type SecretSantaProps = {
  id: SecretSantaId
  description?: string
  budget?: number
  status: SecretSantaStatus
  eventId: EventId
  users: SecretSantaUser[]
  createdAt: Date
  updatedAt: Date
}

export class SecretSanta {
  public readonly id: SecretSantaId
  public readonly description?: string
  public readonly budget?: number
  public readonly status: SecretSantaStatus
  public readonly eventId: EventId
  public readonly users: SecretSantaUser[]
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(props: SecretSantaProps) {
    this.id = props.id
    this.description = props.description
    this.budget = props.budget
    this.status = props.status
    this.eventId = props.eventId
    this.users = props.users
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static create(props: { id: SecretSantaId; description?: string; budget?: number; eventId: EventId }): SecretSanta {
    const now = new Date()
    return new SecretSanta({
      id: props.id,
      description: props.description,
      budget: props.budget,
      status: Status.CREATED,
      eventId: props.eventId,
      users: [],
      createdAt: now,
      updatedAt: now,
    })
  }

  isStarted(): boolean {
    return this.status === Status.STARTED
  }

  isCreated(): boolean {
    return this.status === Status.CREATED
  }

  canBeModified(): boolean {
    return this.isCreated()
  }

  update(updates: { description?: string; budget?: number }): SecretSanta {
    if (!this.canBeModified()) {
      throw new Error('Secret Santa cannot be modified')
    }

    return new SecretSanta({
      ...this,
      ...updates,
      updatedAt: new Date(),
    })
  }

  hasUser(attendeeId: AttendeeId): boolean {
    return this.users.some(user => user.attendeeId === attendeeId)
  }

  canAddUsers(attendeeIds: AttendeeId[]): boolean {
    if (!this.canBeModified()) {
      return false
    }

    return !attendeeIds.some(id => this.hasUser(id))
  }

  updateUserExclusions(userId: SecretSantaUserId, exclusions: SecretSantaUserId[]): SecretSantaUser[] {
    const userToUpdate = this.getUserById(userId)

    if (!userToUpdate) {
      throw new Error('Secret Santa user not found')
    }

    // Validate exclusions exist in this secret santa
    const validExclusions = exclusions.filter(exclusionId => this.users.some(user => user.id === exclusionId))

    return this.users.map(user => (user.id === userId ? user.updateExclusions(validExclusions) : user))
  }

  startAndAssignDraw(): SecretSanta {
    if (this.isStarted()) {
      throw new Error('Secret Santa cannot be started, already started')
    }

    if (this.users.length < 2) {
      throw new Error('Secret Santa cannot be started, not enough users')
    }

    const drawService = new SecretSantaDrawService(
      this.users.map(user => ({
        id: user.id,
        exclusions: user.exclusions,
      })),
    )

    const assignments = drawService.assignSecretSantas()

    const updatedUsers = this.users.map(user => {
      const assignment = assignments.find(a => a.userId === user.id)
      if (!assignment) {
        throw new Error(`No assignment found for user ${user.id}`)
      }
      return user.assignDraw(assignment.drawUserId as SecretSantaUserId)
    })

    return new SecretSanta({
      ...this,
      users: updatedUsers,
      status: Status.STARTED,
      updatedAt: new Date(),
    })
  }

  cancel(): SecretSanta {
    if (this.isCreated()) {
      throw new Error('Secret Santa not yet started')
    }

    const resetUsers = this.users.map(user => user.resetDraw())

    return new SecretSanta({
      ...this,
      users: resetUsers,
      status: Status.CREATED,
      updatedAt: new Date(),
    })
  }

  private getUserById(userId: SecretSantaUserId): SecretSantaUser | undefined {
    return this.users.find(user => user.id === userId)
  }
}
