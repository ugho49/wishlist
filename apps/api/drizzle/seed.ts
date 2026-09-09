import { SQL } from 'bun';
import { createConsola } from 'consola';
import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/bun-sql';
import { reset } from 'drizzle-seed';

import { createSqlClient } from '../src/core/database/create-sql-client';
import * as schema from './schema';
import { seedEvents } from './seeders/event.seeder';
import { seedEventAttendees } from './seeders/event-attendee.seeder';
import { seedEventWishlists } from './seeders/event-wishlist.seeder';
import { seedItems } from './seeders/item.seeder';
import { seedItemTakers } from './seeders/item-taker.seeder';
import { seedUsers } from './seeders/user.seeder';
import { seedUserAccounts } from './seeders/user-account.seeder';
import { seedUserEmailSettings } from './seeders/user-email-setting.seeder';
import { seedWishlists } from './seeders/wishlist.seeder';

dotenv.config();

const consola = createConsola();

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var ${name}`);
  }
  return value;
}

async function runSeeder<T>(label: string, seeder: () => Promise<T[]>): Promise<T[]> {
  consola.start(`Seeding ${label}...`);
  const rows = await seeder();
  consola.success(`${rows.length} ${label} seeded`);
  return rows;
}

async function checkDatabaseConnection(client: SQL) {
  try {
    await client`SELECT 1`;
    consola.success('Connected to the database !');
  } catch (error) {
    consola.error('Failed to connect to the database', error);
    process.exit(1);
  }
}

async function main() {
  consola.box('Database seeding');

  const client = createSqlClient({
    host: requiredEnv('DB_HOST'),
    port: Number.parseInt(requiredEnv('DB_PORT'), 10),
    username: requiredEnv('DB_USERNAME'),
    password: requiredEnv('DB_PASSWORD'),
    database: requiredEnv('DB_NAME'),
  });

  await checkDatabaseConnection(client);

  const db = drizzle(client);

  const shouldReset = await consola.prompt('Do you want to reset the database?', {
    type: 'confirm',
    initial: true,
  });

  if (shouldReset) {
    consola.start('Resetting database in progress...');
    await reset(db, schema);
    consola.success('Database reset completed');
  }

  const users = await runSeeder('users', () => seedUsers(db));
  await runSeeder('user accounts', () => seedUserAccounts(db, { users }));
  await runSeeder('user email settings', () => seedUserEmailSettings(db, { users }));

  const events = await runSeeder('events', () => seedEvents(db));
  const attendees = await runSeeder('event attendees', () => seedEventAttendees(db, { events, users }));

  const wishlists = await runSeeder('wishlists', () => seedWishlists(db, { users, attendees }));
  await runSeeder('event wishlists', () => seedEventWishlists(db, { wishlists, attendees }));

  const items = await runSeeder('items', () => seedItems(db, { wishlists }));
  await runSeeder('item takers', () => seedItemTakers(db, { items, wishlists, users }));

  consola.box('Seeding complete');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    consola.error('Failed to seed the database', error);
    process.exit(1);
  });
