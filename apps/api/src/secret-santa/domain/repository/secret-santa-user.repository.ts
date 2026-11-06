import type { EventId, SecretSantaId, SecretSantaUserId, UserId } from '@wishlist/common';
import type { DrizzleTransaction } from '../../../core/database/transaction-manager';
import type { SecretSantaUser } from '../model/secret-santa-user.model';

export interface SecretSantaUserRepository {
  newId(): SecretSantaUserId;
  findById(id: SecretSantaUserId): Promise<SecretSantaUser | undefined>;
  findBySecretSantaId(secretSantaId: SecretSantaId): Promise<SecretSantaUser[]>;
  findParticipantForEvent(param: { eventId: EventId; userId: UserId }): Promise<SecretSantaUser | undefined>;
  saveAll(users: SecretSantaUser[], tx?: DrizzleTransaction): Promise<void>;
  delete(id: SecretSantaUserId, tx?: DrizzleTransaction): Promise<void>;
}
