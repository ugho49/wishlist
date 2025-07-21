import { BadRequestException, Inject, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { TransactionManager } from '@wishlist/api/core'
import { EVENT_ATTENDEE_REPOSITORY, EVENT_REPOSITORY, WISHLIST_REPOSITORY } from '@wishlist/api/repositories'
import { WishlistRepository } from '@wishlist/api/wishlist'

import { DeleteEventCommand, EventAttendeeRepository, EventRepository } from '../../domain'

@CommandHandler(DeleteEventCommand)
export class DeleteEventUseCase implements IInferredCommandHandler<DeleteEventCommand> {
  constructor(
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: EventRepository,
    @Inject(EVENT_ATTENDEE_REPOSITORY) private readonly attendeeRepository: EventAttendeeRepository,
    @Inject(WISHLIST_REPOSITORY) private readonly wishlistRepository: WishlistRepository,
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(command: DeleteEventCommand): Promise<void> {
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
      for (const attendee of event.attendees) {
        await this.attendeeRepository.delete(attendee.id, tx)
      }

      await this.eventRepository.delete(event.id, tx)
    })
  }
}
