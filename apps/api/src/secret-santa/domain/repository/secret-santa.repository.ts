import type { EventId, SecretSantaId, UserId } from '@wishlist/common'

import type { DrizzleTransaction } from '../../../core/database'
import type { SecretSantaModel } from '../model/secret-santa.model'

export interface SecretSantaRepository {
  save(secretSanta: SecretSantaModel, tx?: DrizzleTransaction): Promise<void>
  findById(id: SecretSantaId): Promise<SecretSantaModel | undefined>
  existsForEvent(eventId: EventId): Promise<boolean>
  getSecretSantaForEventAndUser(param: { eventId: EventId; userId: UserId }): Promise<SecretSantaModel | undefined>
  getSecretSantaForUserOrFail(param: { id: SecretSantaId; userId: UserId }): Promise<SecretSantaModel>
  delete(id: SecretSantaId, tx?: DrizzleTransaction): Promise<void>
}
