import type { EventId, SecretSantaId, UserId } from '@wishlist/common';
import type { DrizzleTransaction } from '../../../core/database/transaction-manager';
import type { SecretSanta } from '../model/secret-santa.model';

export interface SecretSantaRepository {
  newId(): SecretSantaId;
  findById(id: SecretSantaId): Promise<SecretSanta | undefined>;
  findByIdOrFail(id: SecretSantaId): Promise<SecretSanta>;
  findForEvent(param: { eventId: EventId }): Promise<SecretSanta | undefined>;
  findByEventIds(eventIds: EventId[]): Promise<SecretSanta[]>;
  findVisibleForUserPaginated(params: {
    userId: UserId;
    pagination: { take: number; skip: number };
  }): Promise<{ secretSantas: SecretSanta[]; totalCount: number }>;
  existsForEvent(eventId: EventId): Promise<boolean>;
  save(secretSanta: SecretSanta, tx?: DrizzleTransaction): Promise<void>;
  delete(id: SecretSantaId, tx?: DrizzleTransaction): Promise<void>;
}
