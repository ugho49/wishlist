import type { UserId, UserPasswordVerificationId } from '@wishlist/common';
import type { DrizzleTransaction } from '../../../core/database/transaction-manager';
import type { UserPasswordVerification } from '../model/user-password-verification.model';

export interface UserPasswordVerificationRepository {
  newId(): UserPasswordVerificationId;
  findByUserId(userId: UserId): Promise<UserPasswordVerification[]>;
  save(userPasswordVerification: UserPasswordVerification, tx?: DrizzleTransaction): Promise<void>;
  delete(id: UserPasswordVerificationId, tx?: DrizzleTransaction): Promise<void>;
}
