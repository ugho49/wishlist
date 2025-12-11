import { BadRequestException, Inject, Logger, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { TransactionManager } from '@wishlist/api/core'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { WishlistRepository } from '@wishlist/api/wishlist'

import { DeleteEventCommand, EventAttendeeRepository, EventRepository } from '../../domain'

@CommandHandler(DeleteEventCommand)
export class DeleteEventUseCase implements IInferredCommandHandler<DeleteEventCommand> {
  private readonly logger = new Logger(DeleteEventUseCase.name)

  constructor(
    @Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository,
    @Inject(REPOSITORIES.EVENT_ATTENDEE) private readonly attendeeRepository: EventAttendeeRepository,
    @Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository,
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(command: DeleteEventCommand): Promise<void> {
    this.logger.log('Delete event request received', { command })
    const { currentUser, eventId } = command

    const event = await this.eventRepository.findByIdOrFail(eventId)

    if (!event.canEdit(currentUser)) {
      throw new UnauthorizedException('Only maintainers of the event can delete it')
    }

    const wishlists = await this.wishlistRepository.findByEvent(event.id)

    if (wishlists.length > 0) {
      throw new BadRequestException('Event has wishlists, cannot delete it')
    }

    await this.transactionManager.runInTransaction(async tx => {
      this.logger.log('Deleting attendees...', { eventId })
      for (const attendee of event.attendees) {
        await this.attendeeRepository.delete(attendee.id, tx)
      }

      this.logger.log('Deleting event...', { eventId })
      await this.eventRepository.delete(event.id, tx)
    })
  }
}
