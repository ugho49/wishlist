import type { EventRepository } from '../../domain/repository/event.repository';
import type { EventAttendeeRepository } from '../../domain/repository/event-attendee.repository';

import { type EventId, type ICurrentUser } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { EventPublisher } from '@znight/events';
import { BadRequestException, UnauthorizedException } from '@znight/http';
import { getLogger } from '@znight/observability';

import { type UserRepository } from '../../../user/domain/repository/user.repository';
import { AttendeeRole } from '../../domain/attendee-role.enum';
import { AttendeeAddedEvent } from '../../domain/event/attendee-added.event';
import { EventAttendee } from '../../domain/model/event-attendee.model';

export type AddAttendeeInput = {
  currentUser: ICurrentUser;
  eventId: EventId;
  newAttendee: {
    email: string;
    role?: AttendeeRole;
  };
};

export type AddAttendeeOutput = {
  attendee: EventAttendee;
};

@Injectable()
export class AddAttendeeUseCase {
  private readonly logger = getLogger(AddAttendeeUseCase.name);

  constructor(
    private readonly eventRepository: EventRepository,
    private readonly attendeeRepository: EventAttendeeRepository,
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventPublisher,
  ) {}

  async execute(input: AddAttendeeInput): Promise<AddAttendeeOutput> {
    const { eventId, currentUser } = input;
    this.logger.info('Add attendee request received', { eventId, currentUser });

    const event = await this.eventRepository.findByIdOrFail(eventId);

    if (!event.canEdit(currentUser)) {
      throw new UnauthorizedException('Only creators and admins of the event can add an attendee');
    }

    const attendeeAlreadyExists = event.attendees.some(attendee => attendee.getEmail() === input.newAttendee.email);

    if (attendeeAlreadyExists) {
      throw new BadRequestException('This attendee already exist for this event');
    }

    const user = await this.userRepository.findByEmail(input.newAttendee.email);
    const role = input.newAttendee.role ?? AttendeeRole.PARTICIPANT;

    if (role === AttendeeRole.CREATOR) {
      throw new BadRequestException('Cannot assign the creator role to an attendee');
    }
    const attendeeId = this.attendeeRepository.newId();

    const newAttendee = user
      ? EventAttendee.createFromExistingUser({
          id: attendeeId,
          eventId,
          user,
          role,
        })
      : EventAttendee.createFromNonExistingUser({
          id: attendeeId,
          eventId,
          pendingEmail: input.newAttendee.email,
          role,
        });

    this.logger.info('Saving attendee...', { newAttendee });
    await this.attendeeRepository.save(newAttendee);

    const invitedBy = await this.userRepository.findByIdOrFail(currentUser.id);

    await this.eventBus.publish(
      new AttendeeAddedEvent({
        event,
        newAttendee: newAttendee,
        invitedBy,
      }),
    );

    return { attendee: newAttendee };
  }
}
