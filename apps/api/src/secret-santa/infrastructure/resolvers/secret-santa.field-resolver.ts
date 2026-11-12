import { Loader, Parent, ResolveField, Resolver } from '@znight/graphql';
import { NotFoundException } from '@znight/http';

import { EventsById } from '../../../event/infrastructure/event.dataloader';
import { EventAttendeesById } from '../../../event/infrastructure/event-attendee.dataloader';
import { type Event, type EventAttendee, type SecretSanta, type SecretSantaUser } from '../../../gql/generated-types';

@Resolver('SecretSanta')
export class SecretSantaFieldResolver {
  @ResolveField()
  async event(@Parent() secretSanta: SecretSanta, @Loader() eventsLoader: Loader<EventsById>): Promise<Event> {
    const event = await eventsLoader.load(secretSanta.eventId);
    if (!event) {
      throw new NotFoundException(`Event with id ${secretSanta.eventId} of secret santa ${secretSanta.id} not found`);
    }
    return event;
  }
}

@Resolver('SecretSantaUser')
export class SecretSantaUserFieldResolver {
  @ResolveField()
  async attendee(
    @Parent() user: SecretSantaUser,
    @Loader() attendeesLoader: Loader<EventAttendeesById>,
  ): Promise<EventAttendee> {
    const attendee = await attendeesLoader.load(user.attendeeId);
    if (!attendee) {
      throw new NotFoundException(`Attendee with id ${user.attendeeId} of secret santa user ${user.id} not found`);
    }
    return attendee;
  }
}
