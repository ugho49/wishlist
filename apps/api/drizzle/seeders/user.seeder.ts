import type { SeedDb, UserSeed } from './types';

import { faker } from '@faker-js/faker';

import { Authorities } from '../../src/user/domain/authorities.enum';
import * as schema from '../schema';
import { ADMIN_USER, seedConfig } from './config';
import { uuid } from './helpers';

export async function seedUsers(db: SeedDb): Promise<UserSeed[]> {
  const users: UserSeed[] = [
    {
      id: ADMIN_USER.id,
      email: ADMIN_USER.email,
      firstName: ADMIN_USER.firstName,
      lastName: ADMIN_USER.lastName,
      pictureUrl: faker.image.avatar(),
      authorities: [Authorities.ROLE_SUPERADMIN],
    },
  ];

  for (let i = 0; i < seedConfig.users.count; i++) {
    users.push({
      id: uuid(),
      email: `test${i}@test.fr`,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      birthday: faker.date.birthdate().toISOString(),
      pictureUrl: faker.image.avatar(),
      authorities: [Authorities.ROLE_USER],
    });
  }

  await db.insert(schema.user).values(users);
  return users;
}
