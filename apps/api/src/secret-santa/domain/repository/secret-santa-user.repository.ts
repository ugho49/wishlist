import type { EventId, SecretSantaId, SecretSantaUserId, UserId } from '@wishlist/common'

import type { DrizzleTransaction } from '../../../core/database'
import type { SecretSantaUserModel } from '../model/secret-santa-user.model'

export interface SecretSantaUserRepository {
  findBySecretSantaId(secretSantaId: SecretSantaId): Promise<SecretSantaUserModel[]>
  save(users: SecretSantaUserModel[], tx?: DrizzleTransaction): Promise<void>
  getDrawSecretSantaUserForEvent(param: { eventId: EventId; userId: UserId }): Promise<SecretSantaUserModel | null>
  delete(id: SecretSantaUserId, tx?: DrizzleTransaction): Promise<void>
}
