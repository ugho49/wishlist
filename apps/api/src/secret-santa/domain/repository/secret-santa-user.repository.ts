import type { DrizzleTransaction } from '@wishlist/api/core'
import type { EventId, SecretSantaId, SecretSantaUserId, UserId } from '@wishlist/common'
import type { SecretSantaUser } from '../model'

export interface SecretSantaUserRepository {
  newId(): SecretSantaUserId
  findBySecretSantaId(secretSantaId: SecretSantaId): Promise<SecretSantaUser[]>
  findDrawSecretSantaUserForEvent(param: { eventId: EventId; userId: UserId }): Promise<SecretSantaUser | undefined>
  saveAll(users: SecretSantaUser[], tx?: DrizzleTransaction): Promise<void>
  delete(id: SecretSantaUserId, tx?: DrizzleTransaction): Promise<void>
}
