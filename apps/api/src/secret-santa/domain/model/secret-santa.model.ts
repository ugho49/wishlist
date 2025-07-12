import type { AttendeeId, EventId, SecretSantaId, SecretSantaStatus, SecretSantaUserId } from '@wishlist/common'

import type { SecretSantaUserModel } from './secret-santa-user.model'

import { SecretSantaDrawService, SecretSantaStatus as Status, uuid } from '@wishlist/common'

export type SecretSantaModelProps = {
  id: SecretSantaId
  description?: string
  budget?: number
  status: SecretSantaStatus
  eventId: EventId
  users: SecretSantaUserModel[]
  createdAt: Date
  updatedAt: Date
}

export class SecretSantaModel {
  public readonly id: SecretSantaId
  public readonly description?: string
  public readonly budget?: number
  public readonly status: SecretSantaStatus
  public readonly eventId: EventId
  public readonly users: SecretSantaUserModel[]
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(props: SecretSantaModelProps) {
    this.id = props.id
    this.description = props.description
    this.budget = props.budget
    this.status = props.status
    this.eventId = props.eventId
    this.users = props.users
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static create(props: { description?: string; budget?: number; eventId: EventId }): SecretSantaModel {
    const now = new Date()
    return new SecretSantaModel({
      id: uuid() as SecretSantaId,
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

  canBeStarted(): boolean {
    return this.isCreated() && this.users.length >= 2
  }

  canBeModified(): boolean {
    return this.isCreated()
  }

  update(updates: { description?: string; budget?: number }): SecretSantaModel {
    if (!this.canBeModified()) {
      throw new Error('Secret Santa cannot be modified')
    }

    return new SecretSantaModel({
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

  getUserByAttendeeId(attendeeId: AttendeeId): SecretSantaUserModel | undefined {
    return this.users.find(user => user.attendeeId === attendeeId)
  }

  startAndAssignDraw(): SecretSantaModel {
    if (!this.canBeStarted()) {
      throw new Error('Secret Santa cannot be started')
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

    return new SecretSantaModel({
      ...this,
      users: updatedUsers,
      status: Status.STARTED,
      updatedAt: new Date(),
    })
  }

  cancel(): SecretSantaModel {
    if (this.isCreated()) {
      throw new Error('Secret Santa not yet started')
    }

    const resetUsers = this.users.map(user => user.resetDraw())

    return new SecretSantaModel({
      ...this,
      users: resetUsers,
      status: Status.CREATED,
      updatedAt: new Date(),
    })
  }
}
