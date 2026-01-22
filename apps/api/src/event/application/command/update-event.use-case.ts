import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { EventId, ICurrentUser } from '@wishlist/common'

import { EventRepository } from '../../domain'

export type UpdateEventInput = {
  currentUser: ICurrentUser
  eventId: EventId
  updateEvent: {
    title: string
    description?: string
    icon?: string
    eventDate: Date
  }
}

@Injectable()
export class UpdateEventUseCase {
  private readonly logger = new Logger(UpdateEventUseCase.name)

  constructor(@Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository) {}

  async execute(input: UpdateEventInput): Promise<void> {
    this.logger.log('Update event request received', { input })
    const event = await this.eventRepository.findByIdOrFail(input.eventId)

    if (!event.canEdit(input.currentUser)) {
      throw new UnauthorizedException('Only maintainers of the event can update it')
    }

    const updatedEvent = event.update({
      title: input.updateEvent.title,
      description: input.updateEvent.description,
      icon: input.updateEvent.icon,
      eventDate: input.updateEvent.eventDate,
    })

    this.logger.log('Saving event...', { eventId: input.eventId, updatedEvent })
    await this.eventRepository.save(updatedEvent)
  }
}
