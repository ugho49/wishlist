import type { EventRepository } from '../../domain/repository/event.repository';
import type { EventAttendeeRepository } from '../../domain/repository/event-attendee.repository';

import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { type ICurrentUser } from '@wishlist/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { type UserRepository } from '../../../user/domain/repository/user.repository';
import { AttendeeRole } from '../../domain/attendee-role.enum';
import { Event } from '../../domain/model/event.model';
import { EventAttendee } from '../../domain/model/event-attendee.model';

export type JoinEventByInviteInput = {
  currentUser: ICurrentUser;
  token: string;
};

export type JoinEventByInviteOutput = {
  event: Event;
};

@Injectable()
export class JoinEventByInviteUseCase {
  private readonly logger = new Logger(JoinEventByInviteUseCase.name);

  constructor(
    @Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository,
    @Inject(REPOSITORIES.EVENT_ATTENDEE) private readonly attendeeRepository: EventAttendeeRepository,
    @Inject(REPOSITORIES.USER) private readonly userRepository: UserRepository,
  ) {}

  async execute(input: JoinEventByInviteInput): Promise<JoinEventByInviteOutput> {
    const { currentUser, token } = input;
    this.logger.log('Join event by invite', { token, userId: currentUser.id });

    const event = await this.eventRepository.findByInviteToken(token);
    if (!event) {
      throw new NotFoundException('Invitation not found');
    }

    if (event.canView(currentUser)) {
      return { event };
    }

    const user = await this.userRepository.findByIdOrFail(currentUser.id);
    const pendingAttendee = event.attendees.find(
      candidate => candidate.isTemporaryAttendee() && candidate.getEmail() === user.email,
    );

    const attendee = pendingAttendee
      ? pendingAttendee.convertTemporaryAttendeeToUser(user)
      : EventAttendee.createFromExistingUser({
          id: this.attendeeRepository.newId(),
          eventId: event.id,
          user,
          role: AttendeeRole.PARTICIPANT,
        });

    this.logger.log('Saving self-joined attendee...', { attendeeId: attendee.id, eventId: event.id });
    await this.attendeeRepository.save(attendee);

    const joined = await this.eventRepository.findByIdOrFail(event.id);
    return { event: joined };
  }
}
