import type { EventAttendeeSeed, EventSeed, SeedDb, UserSeed } from './types';

import { faker } from '@faker-js/faker';

import { AttendeeRole } from '../../src/event/domain/attendee-role.enum';
import * as schema from '../schema';
import { seedConfig } from './config';
import { chance, intBetween, pickOne, uuid } from './helpers';

export async function seedEventAttendees(
  db: SeedDb,
  deps: { events: readonly EventSeed[]; users: readonly UserSeed[] },
): Promise<EventAttendeeSeed[]> {
  const attendees: EventAttendeeSeed[] = [];

  for (const event of deps.events) {
    const creator = pickOne(deps.users);
    const usedUserIds = new Set<string>([creator.id]);

    attendees.push({
      id: uuid(),
      eventId: event.id,
      userId: creator.id,
      role: AttendeeRole.CREATOR,
    });

    const extraCount = intBetween(seedConfig.attendees.extraPerEvent);

    for (let i = 0; i < extraCount; i++) {
      if (chance(seedConfig.attendees.tempUserProbability)) {
        attendees.push({
          id: uuid(),
          eventId: event.id,
          tempUserEmail: faker.internet.email(),
          role: AttendeeRole.PARTICIPANT,
        });
        continue;
      }

      const remainingUsers = deps.users.filter(user => !usedUserIds.has(user.id));
      if (remainingUsers.length === 0) continue;

      const attendee = pickOne(remainingUsers);
      usedUserIds.add(attendee.id);

      attendees.push({
        id: uuid(),
        eventId: event.id,
        userId: attendee.id,
        role: AttendeeRole.PARTICIPANT,
      });
    }
  }

  await db.insert(schema.eventAttendee).values(attendees);
  return attendees;
}
