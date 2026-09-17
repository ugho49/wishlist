import type { EventSeed, SeedDb } from './types';

import { faker } from '@faker-js/faker';
import { DateTime } from 'luxon';

import * as schema from '../schema';
import { seedConfig } from './config';
import { chance, insertInBatches, intBetween, maybe, pickOne, uuid } from './helpers';

const EVENT_ICONS = [
  '🎂',
  '🎄',
  '🎁',
  '🎉',
  '🥳',
  '💍',
  '🐣',
  '🎃',
  '🥂',
  '🎓',
  '🏠',
  '✈️',
  '⚽',
  '🎵',
  '💝',
  '🌟',
  '🌸',
  '🎅',
  '🎆',
  '🎈',
] as const;

export async function seedEvents(db: SeedDb): Promise<EventSeed[]> {
  const events: EventSeed[] = Array.from({ length: seedConfig.events.count }, () => {
    const isPastEvent = chance(seedConfig.events.pastProbability);
    const eventDate = isPastEvent
      ? faker.date.past()
      : faker.date.between({
          from: DateTime.now().plus({ days: 1 }).toJSDate(),
          to: DateTime.now().plus({ years: 1 }).toJSDate(),
        });

    return {
      id: uuid(),
      title: faker.book.title(),
      eventDate: eventDate.toISOString(),
      description: maybe(seedConfig.events.descriptionProbability, () => faker.lorem.paragraph()),
      icon: maybe(seedConfig.events.iconProbability, () => pickOne(EVENT_ICONS)),
      createdAt: isPastEvent
        ? DateTime.fromJSDate(eventDate)
            .minus({ days: intBetween({ min: 1, max: 30 }) })
            .toJSDate()
        : faker.date.between({
            from: DateTime.now().minus({ days: 100 }).toJSDate(),
            to: DateTime.now().toJSDate(),
          }),
    };
  });

  await insertInBatches(db, schema.event, events);
  return events;
}
