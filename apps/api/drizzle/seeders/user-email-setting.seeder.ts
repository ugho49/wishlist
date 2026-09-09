import type { SeedDb, UserEmailSettingSeed, UserSeed } from './types';

import * as schema from '../schema';
import { seedConfig } from './config';
import { chance, uuid } from './helpers';

export async function seedUserEmailSettings(
  db: SeedDb,
  deps: { users: readonly UserSeed[] },
): Promise<UserEmailSettingSeed[]> {
  const settings: UserEmailSettingSeed[] = deps.users.map(user => ({
    id: uuid(),
    userId: user.id,
    dailyNewItemNotification: chance(seedConfig.users.dailyNewItemNotificationProbability),
  }));

  await db.insert(schema.userEmailSetting).values(settings);
  return settings;
}
