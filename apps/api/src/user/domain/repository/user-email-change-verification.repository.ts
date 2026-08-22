import type { UserEmailChangeVerificationId, UserId } from '@wishlist/common';
import type { DrizzleTransaction } from '../../../core/database/transaction-manager';
import type { UserEmailChangeVerification } from '../model/user-email-change-verification.model';

export interface UserEmailChangeVerificationRepository {
  newId(): UserEmailChangeVerificationId;
  findByUserId(userId: UserId): Promise<UserEmailChangeVerification[]>;
  findByTokenAndEmail(token: string, email: string): Promise<UserEmailChangeVerification | undefined>;
  save(userEmailChangeVerification: UserEmailChangeVerification, tx?: DrizzleTransaction): Promise<void>;
}
