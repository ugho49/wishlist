import type { DrizzleTransaction } from '@wishlist/api/core'
import type { EventId, SecretSantaId } from '@wishlist/common'
import type { SecretSanta } from '../model'

export interface SecretSantaRepository {
  newId(): SecretSantaId
  findById(id: SecretSantaId): Promise<SecretSanta | undefined>
  findByIdOrFail(id: SecretSantaId): Promise<SecretSanta>
  findForEvent(param: { eventId: EventId }): Promise<SecretSanta | undefined>
  existsForEvent(eventId: EventId): Promise<boolean>
  save(secretSanta: SecretSanta, tx?: DrizzleTransaction): Promise<void>
  delete(id: SecretSantaId, tx?: DrizzleTransaction): Promise<void>
}
