import type { SeedDb, UserSeed } from './types';

import { faker } from '@faker-js/faker';
import { DateTime } from 'luxon';

import { Authorities } from '../../src/user/domain/authorities.enum';
import * as schema from '../schema';
import { ADMIN_USER, seedConfig } from './config';
import { insertInBatches, uuid } from './helpers';

export async function seedUsers(db: SeedDb): Promise<UserSeed[]> {
  const users: UserSeed[] = [
    {
      id: ADMIN_USER.id,
      email: ADMIN_USER.email,
      firstName: ADMIN_USER.firstName,
      lastName: ADMIN_USER.lastName,
      pictureUrl: faker.image.avatar(),
      authorities: [Authorities.ROLE_SUPERADMIN],
      createdAt: DateTime.now().minus({ years: 2 }).toJSDate(),
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
      createdAt: faker.date.between({
        from: DateTime.now().minus({ years: 2 }).toJSDate(),
        to: DateTime.now().toJSDate(),
      }),
    });
  }

  await insertInBatches(db, schema.user, users);
  return users;
}
