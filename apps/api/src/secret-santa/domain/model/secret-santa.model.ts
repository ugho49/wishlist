import type { EventId, SecretSantaId, SecretSantaStatus } from '@wishlist/common-types'

import type { SecretSantaUserModel } from './secret-santa-user.model'

export type SecretSantaModelProps = {
  id: SecretSantaId
  description?: string
  budget?: number
  status: SecretSantaStatus
  eventId: EventId
  users: SecretSantaUserModel[]
}

export class SecretSantaModel {
  public readonly id: SecretSantaId
  public readonly description?: string
  public readonly budget?: number
  public readonly status: SecretSantaStatus
  public readonly eventId: EventId
  public readonly users: SecretSantaUserModel[]

  constructor(props: SecretSantaModelProps) {
    this.id = props.id
    this.description = props.description
    this.budget = props.budget
    this.status = props.status
    this.eventId = props.eventId
    this.users = props.users
  }
}
