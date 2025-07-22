import { Inject, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { EventRepository, UpdateEventCommand } from '../../domain'

@CommandHandler(UpdateEventCommand)
export class UpdateEventUseCase implements IInferredCommandHandler<UpdateEventCommand> {
  constructor(@Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository) {}

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
