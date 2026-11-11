import type { EventRepository } from '../../domain/repository/event.repository';
import type { EventAttendeeRepository } from '../../domain/repository/event-attendee.repository';

import { type AttendeeId, type EventId, type ICurrentUser } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { BadRequestException, ConflictException, NotFoundException, UnauthorizedException } from '@znight/http';
import { getLogger } from '@znight/observability';

import { AttendeeRole } from '../../domain/attendee-role.enum';

export type UpdateAttendeeRoleInput = {
  currentUser: ICurrentUser;
  eventId: EventId;
  attendeeId: AttendeeId;
  role: AttendeeRole;
};

@Injectable()
export class UpdateAttendeeRoleUseCase {
  private readonly logger = getLogger(UpdateAttendeeRoleUseCase.name);

  constructor(
    private readonly eventRepository: EventRepository,
    private readonly attendeeRepository: EventAttendeeRepository,
  ) {}

  async execute(input: UpdateAttendeeRoleInput): Promise<void> {
    this.logger.info('Update attendee role request received', { input });
    const { attendeeId, currentUser, eventId, role } = input;

    const event = await this.eventRepository.findByIdOrFail(eventId);

    if (!event.canEdit(currentUser)) {
      throw new UnauthorizedException('Only creators and admins of the event can update an attendee role');
    }

    const attendee = event.attendees.find(a => a.id === attendeeId);

    if (!attendee) {
      throw new NotFoundException('Attendee not found');
    }

    if (!currentUser.isAdmin && attendee.user?.id === currentUser.id) {
      throw new ConflictException('You cannot change your own role');
    }

    if (attendee.isCreator()) {
      throw new ConflictException('You cannot change the creator role');
    }

    if (role === AttendeeRole.CREATOR) {
      throw new BadRequestException('Cannot assign the creator role to an attendee');
    }

    if (role !== AttendeeRole.ADMIN && role !== AttendeeRole.PARTICIPANT) {
      throw new BadRequestException('Role must be admin or participant');
    }

    const updatedAttendee = attendee.updateRole(role);

    this.logger.info('Saving attendee role...', { attendeeId, eventId, role });
    await this.attendeeRepository.save(updatedAttendee);
  }
}
