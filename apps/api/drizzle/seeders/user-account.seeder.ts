import type { SeedDb, UserAccountSeed, UserSeed } from './types';

import { PasswordManager } from '../../src/auth/infrastructure/util/password-manager';
import { UserAccountProvider } from '../../src/user/domain/user-account-provider.enum';
import * as schema from '../schema';
import { seedConfig } from './config';
import { uuid } from './helpers';

export async function seedUserAccounts(db: SeedDb, deps: { users: readonly UserSeed[] }): Promise<UserAccountSeed[]> {
  const passwordHash = await PasswordManager.hash(seedConfig.users.password);

  const accounts: UserAccountSeed[] = deps.users.map(user => ({
    id: uuid(),
    userId: user.id,
    provider: UserAccountProvider.PASSWORD,
    email: user.email,
    passwordHash,
  }));

  await db.insert(schema.userAccount).values(accounts);
  return accounts;
}
