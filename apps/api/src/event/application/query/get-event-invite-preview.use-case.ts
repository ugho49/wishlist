import type { EventRepository } from '../../domain/repository/event.repository';

import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { type ICurrentUser } from '@wishlist/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { AttendeeRole } from '../../domain/attendee-role.enum';
import { Event } from '../../domain/model/event.model';

export type EventInvitePreview = {
  title: string;
  description?: string;
  icon?: string;
  eventDate: Date;
  attendeeCount: number;
  hostDisplayName: string;
  alreadyJoined: boolean;
};

export type GetEventInvitePreviewInput = {
  token: string;
  currentUser?: ICurrentUser;
};

export type GetEventInvitePreviewOutput = {
  preview: EventInvitePreview;
};

@Injectable()
export class GetEventInvitePreviewUseCase {
  private readonly logger = new Logger(GetEventInvitePreviewUseCase.name);

  constructor(@Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository) {}

  async execute(input: GetEventInvitePreviewInput): Promise<GetEventInvitePreviewOutput> {
    this.logger.log('Get event invite preview', { token: input.token });

    const event = await this.eventRepository.findByInviteToken(input.token);
    if (!event) {
      throw new NotFoundException('Invitation not found');
    }

    return { preview: toPreview(event, input.currentUser) };
  }
}

function toPreview(event: Event, currentUser?: ICurrentUser): EventInvitePreview {
  const creator = event.attendees.find(attendee => attendee.role === AttendeeRole.CREATOR);

  return {
    title: event.title,
    description: event.description,
    icon: event.icon,
    eventDate: event.eventDate,
    attendeeCount: event.attendees.length,
    hostDisplayName: creator?.getFullNameOrPendingEmail() || event.title,
    alreadyJoined: currentUser ? event.canView(currentUser) : false,
  };
}
