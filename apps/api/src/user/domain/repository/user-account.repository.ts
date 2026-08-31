import type { UserAccountId, UserId } from '@wishlist/common';
import type { DrizzleTransaction } from '../../../core/database/transaction-manager';
import type { UserAccount } from '../model/user-account.model';
import type { UserAccountProvider } from '../user-account-provider.enum';

export interface UserAccountRepository {
  newId(): UserAccountId;
  findByIds(userAccountIds: UserAccountId[]): Promise<UserAccount[]>;
  findByUserId(userId: UserId): Promise<UserAccount[]>;
  findByUserIds(userIds: UserId[]): Promise<UserAccount[]>;
  findByUserIdAndProvider(userId: UserId, provider: UserAccountProvider): Promise<UserAccount | undefined>;
  findByProviderAccountId(providerAccountId: string, provider: UserAccountProvider): Promise<UserAccount | undefined>;
  save(userAccount: UserAccount, tx?: DrizzleTransaction): Promise<void>;
  delete(id: UserAccountId, tx?: DrizzleTransaction): Promise<void>;
}
