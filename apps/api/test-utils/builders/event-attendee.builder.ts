import type { AttendeeId, EventId } from '@wishlist/common';

import { uuid } from '@wishlist/common';

import { AttendeeRole } from '../../src/event/domain/attendee-role.enum';
import { EventAttendee } from '../../src/event/domain/model/event-attendee.model';
import { User } from '../../src/user/domain/model/user.model';

type EventAttendeeBuilderData = {
  eventId: EventId;
  user?: User;
  pendingEmail?: string;
  role: AttendeeRole;
};

export class EventAttendeeBuilder {
  private readonly data: EventAttendeeBuilderData = {
    eventId: uuid() as EventId,
    role: AttendeeRole.PARTICIPANT,
  };

  withEventId(eventId: EventId): this {
    this.data.eventId = eventId;
    return this;
  }

  withUser(user: User): this {
    this.data.user = user;
    this.data.pendingEmail = undefined;
    return this;
  }

  withPendingEmail(email: string): this {
    this.data.pendingEmail = email;
    this.data.user = undefined;
    return this;
  }

  asCreator(): this {
    this.data.role = AttendeeRole.CREATOR;
    return this;
  }

  asAdmin(): this {
    this.data.role = AttendeeRole.ADMIN;
    return this;
  }

  asParticipant(): this {
    this.data.role = AttendeeRole.PARTICIPANT;
    return this;
  }

  withRole(role: AttendeeRole): this {
    this.data.role = role;
    return this;
  }

  build(): EventAttendee {
    if (this.data.user) {
      return EventAttendee.createFromExistingUser({
        id: uuid() as AttendeeId,
        eventId: this.data.eventId,
        user: this.data.user,
        role: this.data.role,
      });
    }

    return EventAttendee.createFromNonExistingUser({
      id: uuid() as AttendeeId,
      eventId: this.data.eventId,
      pendingEmail: this.data.pendingEmail ?? 'pending@test.fr',
      role: this.data.role,
    });
  }
}
