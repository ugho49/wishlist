import type { EventSeed, SeedDb } from './types';

import { faker } from '@faker-js/faker';
import { DateTime } from 'luxon';

import * as schema from '../schema';
import { seedConfig } from './config';
import { chance, maybe, uuid } from './helpers';

export async function seedEvents(db: SeedDb): Promise<EventSeed[]> {
  const events: EventSeed[] = Array.from({ length: seedConfig.events.count }, () => {
    const isPastEvent = chance(seedConfig.events.pastProbability);

    return {
      id: uuid(),
      title: faker.book.title(),
      eventDate: isPastEvent
        ? faker.date.past().toISOString()
        : faker.date
            .between({
              from: DateTime.now().plus({ days: 1 }).toJSDate(),
              to: DateTime.now().plus({ years: 1 }).toJSDate(),
            })
            .toISOString(),
      description: maybe(seedConfig.events.descriptionProbability, () => faker.lorem.paragraph()),
    };
  });

  await db.insert(schema.event).values(events);
  return events;
}
