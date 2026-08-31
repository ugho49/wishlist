import type { UserId, UserRefreshTokenId } from '@wishlist/common';
import type { DrizzleTransaction } from '../../../core/database/transaction-manager';
import type { UserRefreshToken } from '../model/user-refresh-token.model';

export interface UserRefreshTokenRepository {
  newId(): UserRefreshTokenId;
  findById(id: UserRefreshTokenId): Promise<UserRefreshToken | undefined>;
  findByTokenHash(tokenHash: string): Promise<UserRefreshToken | undefined>;
  findActiveByUserId(userId: UserId): Promise<UserRefreshToken[]>;
  findActiveByUserIds(userIds: UserId[]): Promise<UserRefreshToken[]>;
  save(session: UserRefreshToken, tx?: DrizzleTransaction): Promise<void>;
  revokeAllByUserId(userId: UserId, params?: { exceptId?: UserRefreshTokenId; tx?: DrizzleTransaction }): Promise<void>;
}
