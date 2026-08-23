import type { EventId } from '@wishlist/common';

import { uuid } from '@wishlist/common';

import { AttendeeRole } from '../../src/event/domain/attendee-role.enum';
import { Event } from '../../src/event/domain/model/event.model';
import { EventAttendee } from '../../src/event/domain/model/event-attendee.model';
import { User } from '../../src/user/domain/model/user.model';
import { EventAttendeeBuilder } from './event-attendee.builder';
import { UserBuilder } from './user.builder';

type EventBuilderData = {
  id: EventId;
  title: string;
  eventDate: Date;
  creator: User;
  extraAttendees: EventAttendee[];
};

export class EventBuilder {
  private readonly data: EventBuilderData = {
    id: uuid() as EventId,
    title: 'Anniversaire',
    eventDate: new Date(Date.now() + 86_400_000),
    creator: new UserBuilder().build(),
    extraAttendees: [],
  };

  withTitle(title: string): this {
    this.data.title = title;
    return this;
  }

  withCreator(creator: User): this {
    this.data.creator = creator;
    return this;
  }

  withEventDate(eventDate: Date): this {
    this.data.eventDate = eventDate;
    return this;
  }

  finished(): this {
    this.data.eventDate = new Date(Date.now() - 86_400_000);
    return this;
  }

  withAttendee(user: User, role: AttendeeRole = AttendeeRole.PARTICIPANT): this {
    this.data.extraAttendees.push(
      new EventAttendeeBuilder().withEventId(this.data.id).withUser(user).withRole(role).build(),
    );
    return this;
  }

  withPendingAttendee(email: string, role: AttendeeRole = AttendeeRole.PARTICIPANT): this {
    this.data.extraAttendees.push(
      new EventAttendeeBuilder().withEventId(this.data.id).withPendingEmail(email).withRole(role).build(),
    );
    return this;
  }

  build(): Event {
    const creatorAttendee = new EventAttendeeBuilder()
      .withEventId(this.data.id)
      .withUser(this.data.creator)
      .asCreator()
      .build();

    return Event.create({
      id: this.data.id,
      title: this.data.title,
      eventDate: this.data.eventDate,
      attendees: [creatorAttendee, ...this.data.extraAttendees],
    });
  }
}
