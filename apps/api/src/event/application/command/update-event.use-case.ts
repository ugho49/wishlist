import { Inject, Logger, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { REPOSITORIES } from '@wishlist/api/repositories'

import { EventRepository, UpdateEventCommand } from '../../domain'

@CommandHandler(UpdateEventCommand)
export class UpdateEventUseCase implements IInferredCommandHandler<UpdateEventCommand> {
  private readonly logger = new Logger(UpdateEventUseCase.name)

  constructor(@Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository) {}

  async execute(command: UpdateEventCommand): Promise<void> {
    this.logger.log('Update event request received', { command })
    const event = await this.eventRepository.findByIdOrFail(command.eventId)

    if (!event.canEdit(command.currentUser)) {
      throw new UnauthorizedException('Only maintainers of the event can update it')
    }

    const updatedEvent = event.update({
      title: command.updateEvent.title,
      description: command.updateEvent.description,
      icon: command.updateEvent.icon,
      eventDate: command.updateEvent.eventDate,
    })

    this.logger.log('Saving event...', { eventId: command.eventId, updatedEvent })
    await this.eventRepository.save(updatedEvent)
  }
}
