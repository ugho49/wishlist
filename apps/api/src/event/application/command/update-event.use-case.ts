import { Inject, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { EVENT_REPOSITORY } from '@wishlist/api/repositories'

import { EventRepository, UpdateEventCommand } from '../../domain'

@CommandHandler(UpdateEventCommand)
export class UpdateEventUseCase implements IInferredCommandHandler<UpdateEventCommand> {
  constructor(@Inject(EVENT_REPOSITORY) private readonly eventRepository: EventRepository) {}

  async execute(command: UpdateEventCommand): Promise<void> {
    const event = await this.eventRepository.findByIdOrFail(command.eventId)

    if (!event.canEdit(command.currentUser)) {
      throw new UnauthorizedException('Only maintainers of the event can update it')
    }

    const updatedEvent = event.update({
      title: command.updateEvent.title,
      description: command.updateEvent.description,
      eventDate: command.updateEvent.eventDate,
    })

    await this.eventRepository.save(updatedEvent)
  }
}
