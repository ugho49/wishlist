import type { RateLimiter } from '../../../core/rate-limit/rate-limiter';
import type { EventRepository } from '../../domain/repository/event.repository';
import type { EventAttendeeRepository } from '../../domain/repository/event-attendee.repository';

import { type ICurrentUser } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { EventPublisher } from '@znight/events';
import { BadRequestException } from '@znight/http';
import { getLogger } from '@znight/observability';
import { uniqBy } from 'lodash';

import { RateLimitConfig } from '../../../core/rate-limit/rate-limit.config';
import { type UserRepository } from '../../../user/domain/repository/user.repository';
import { AttendeeRole } from '../../domain/attendee-role.enum';
import { AttendeeAddedEvent } from '../../domain/event/attendee-added.event';
import { Event } from '../../domain/model/event.model';
import { EventAttendee } from '../../domain/model/event-attendee.model';
import { invitationRateLimitRule } from '../invitation-rate-limit';

type NewEventAttendee = {
  email: string;
  role?: AttendeeRole;
};

type NewEvent = {
  title: string;
  description?: string;
  icon?: string;
  eventDate: Date;
  attendees?: NewEventAttendee[];
};

export type CreateEventInput = {
  currentUser: ICurrentUser;
  newEvent: NewEvent;
};

export type CreateEventOutput = {
  event: Event;
};

@Injectable()
export class CreateEventUseCase {
  private readonly logger = getLogger(CreateEventUseCase.name);

  constructor(
    private readonly eventRepository: EventRepository,
    private readonly attendeeRepository: EventAttendeeRepository,
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventPublisher,
    private readonly rateLimiter: RateLimiter,
    private readonly rateLimitConfig: RateLimitConfig,
  ) {}

  async execute(input: CreateEventInput): Promise<CreateEventOutput> {
    this.logger.info('Create event request received', { input });
    // Each email once, and never the current user (added below as creator)
    const invitedAttendees = uniqBy(input.newEvent.attendees ?? [], attendee => attendee.email).filter(
      attendee => attendee.email !== input.currentUser.email,
    );

    if (invitedAttendees.some(attendee => attendee.role === AttendeeRole.CREATOR)) {
      throw new BadRequestException('Cannot assign the creator role to an invited attendee');
    }

    await this.rateLimiter.consume(
      [invitationRateLimitRule(input.currentUser.id, this.rateLimitConfig)],
      invitedAttendees.length,
    );

    const existingUsers = await this.userRepository.findByEmails(invitedAttendees.map(attendee => attendee.email));
    const eventId = this.eventRepository.newId();
    const attendees: EventAttendee[] = [];

    // Add the current user as creator attendee
    const currentUser = await this.userRepository.findByIdOrFail(input.currentUser.id);

    attendees.push(
      EventAttendee.createFromExistingUser({
        id: this.attendeeRepository.newId(),
        eventId,
        user: currentUser,
        role: AttendeeRole.CREATOR,
      }),
    );

    for (const attendee of invitedAttendees) {
      const user = existingUsers.find(u => u.email === attendee.email);
      const id = this.attendeeRepository.newId();
      const role = attendee.role ?? AttendeeRole.PARTICIPANT;

      const newAttendee = user
        ? EventAttendee.createFromExistingUser({ id, eventId, user, role })
        : EventAttendee.createFromNonExistingUser({
            id,
            eventId,
            role,
            pendingEmail: attendee.email,
          });

      attendees.push(newAttendee);
    }

    const event = Event.create({
      id: eventId,
      title: input.newEvent.title,
      description: input.newEvent.description,
      icon: input.newEvent.icon,
      eventDate: input.newEvent.eventDate,
      attendees,
    });

    this.logger.info('Saving event...', { event });
    await this.eventRepository.save(event);

    for (const attendee of attendees.filter(a => a.user?.id !== currentUser.id)) {
      await this.eventBus.publish(new AttendeeAddedEvent({ event, newAttendee: attendee, invitedBy: currentUser }));
    }

    return { event };
  }
}
