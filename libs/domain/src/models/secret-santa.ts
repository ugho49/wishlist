import { Brand, uuid } from '@wishlist/common'

import { SecretSantaStatus } from '../enums'
import { Event } from './event'
import { SecretSantaUser } from './secret-santa-user'

export type SecretSantaId = Brand<string, 'SecretSantaId'>

export class SecretSanta {
  public readonly id: SecretSantaId
  public readonly status: SecretSantaStatus
  public readonly budget?: number
  public readonly description?: string
  public readonly event: Event
  public readonly users: SecretSantaUser[]
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(props: {
    id: SecretSantaId
    status: SecretSantaStatus
    budget?: number
    description?: string
    event: Event
    users?: SecretSantaUser[]
    createdAt?: Date
    updatedAt?: Date
  }) {
    this.id = props.id
    this.status = props.status
    this.budget = props.budget
    this.description = props.description
    this.event = props.event
    this.users = props.users ?? []
    this.createdAt = props.createdAt ?? new Date()
    this.updatedAt = props.updatedAt ?? new Date()
  }

  static getNewId(): SecretSantaId {
    return uuid() as SecretSantaId
  }
}
