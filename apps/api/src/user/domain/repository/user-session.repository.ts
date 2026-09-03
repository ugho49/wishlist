import type { UserId, UserSessionId } from '@wishlist/common';
import type { DrizzleTransaction } from '../../../core/database/transaction-manager';
import type { UserSession } from '../model/user-session.model';

export interface UserSessionRepository {
  newId(): UserSessionId;
  findById(id: UserSessionId): Promise<UserSession | undefined>;
  findByTokenHash(tokenHash: string): Promise<UserSession | undefined>;
  findActiveByUserId(userId: UserId): Promise<UserSession[]>;
  findActiveByUserIds(userIds: UserId[]): Promise<UserSession[]>;
  findNeedingDeviceBackfill(): Promise<UserSession[]>;
  save(session: UserSession, tx?: DrizzleTransaction): Promise<void>;
  revokeAllByUserId(userId: UserId, params?: { exceptId?: UserSessionId; tx?: DrizzleTransaction }): Promise<void>;
}
