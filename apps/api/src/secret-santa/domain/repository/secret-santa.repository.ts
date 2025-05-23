import type { EventId, SecretSantaId, UserId } from '@wishlist/common-types'

import type { SecretSantaUserModel } from '../model/secret-santa-user.model'
import type { SecretSantaModel } from '../model/secret-santa.model'

export interface SecretSantaRepository {
  findById(param: { id: SecretSantaId }): Promise<SecretSantaModel | undefined>
  findByEventAndUser(param: { eventId: EventId; userId: UserId }): Promise<SecretSantaModel | undefined>
  findUserByEvent(param: { eventId: EventId; userId: UserId }): Promise<SecretSantaUserModel | undefined>
}
