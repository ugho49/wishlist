import type { EventRepository } from '../../domain/repository/event.repository';

import { type EventId, type ICurrentUser } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { UnauthorizedException } from '@znight/http';
import { getLogger } from '@znight/observability';

export type UpdateEventInput = {
  currentUser: ICurrentUser;
  eventId: EventId;
  updateEvent: {
    title: string;
    description?: string;
    icon?: string;
    eventDate: Date;
  };
};

@Injectable()
export class UpdateEventUseCase {
  private readonly logger = getLogger(UpdateEventUseCase.name);

  constructor(private readonly eventRepository: EventRepository) {}

  async execute(input: UpdateEventInput): Promise<void> {
    this.logger.info('Update event request received', { input });
    const event = await this.eventRepository.findByIdOrFail(input.eventId);

    if (!event.canEdit(input.currentUser)) {
      throw new UnauthorizedException('Only creators and admins of the event can update it');
    }

    const updatedEvent = event.update({
      title: input.updateEvent.title,
      description: input.updateEvent.description,
      icon: input.updateEvent.icon,
      eventDate: input.updateEvent.eventDate,
    });

    this.logger.info('Saving event...', { eventId: input.eventId, updatedEvent });
    await this.eventRepository.save(updatedEvent);
  }
}
