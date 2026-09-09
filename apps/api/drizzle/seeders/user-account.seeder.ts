import type { SeedDb, UserAccountSeed, UserSeed } from './types';

import { UserAccountProvider } from '../../src/user/domain/user-account-provider.enum';
import * as schema from '../schema';
import { uuid } from './helpers';

export async function seedUserAccounts(
  db: SeedDb,
  deps: { users: readonly UserSeed[]; passwordHash: string },
): Promise<UserAccountSeed[]> {
  const accounts: UserAccountSeed[] = deps.users.map(user => ({
    id: uuid(),
    userId: user.id,
    provider: UserAccountProvider.PASSWORD,
    email: user.email,
    passwordHash: deps.passwordHash,
  }));

  await db.insert(schema.userAccount).values(accounts);
  return accounts;
}
