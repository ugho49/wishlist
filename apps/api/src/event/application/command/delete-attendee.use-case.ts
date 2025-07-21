import { ConflictException, Inject, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { TransactionManager } from '@wishlist/api/core'
import { EVENT_ATTENDEE_REPOSITORY, EVENT_REPOSITORY, WISHLIST_REPOSITORY } from '@wishlist/api/repositories'
import { WishlistRepository } from '@wishlist/api/wishlist'

import { DeleteAttendeeCommand, EventAttendeeRepository, EventRepository } from '../../domain'

@CommandHandler(DeleteAttendeeCommand)
export class DeleteAttendeeUseCase implements IInferredCommandHandler<DeleteAttendeeCommand> {
  constructor(
    @Inject(EVENT_ATTENDEE_REPOSITORY)
    private readonly attendeeRepository: EventAttendeeRepository,
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: EventRepository,
    @Inject(WISHLIST_REPOSITORY)
    private readonly wishlistRepository: WishlistRepository,
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(command: DeleteAttendeeCommand) {
    const { attendeeId, currentUser, eventId } = command

    const event = await this.eventRepository.findByIdOrFail(eventId)

    if (!event.canEdit(currentUser)) {
      throw new UnauthorizedException('Only maintainers of the event can delete an attendee')
    }

    const attendee = event.attendees.find(a => a.id === attendeeId)

    if (!attendee) {
      throw new NotFoundException('Attendee not found')
    }

    if (attendee.user?.id === currentUser.id) {
      throw new ConflictException('You cannot delete yourself from the event')
    }
    const wishlists = await this.wishlistRepository.findByEvent(attendee.eventId)

    await this.transactionManager.runInTransaction(async tx => {
      // Remove the attendee from the event
      await this.attendeeRepository.delete(attendeeId, tx)

      // Check if this is ok for the wishlists
      for (const wishlist of wishlists) {
        if (wishlist.eventIds.length > 1) {
          const updatedWishlist = wishlist.unlinkEvent(attendee.eventId)
          await this.wishlistRepository.save(updatedWishlist, tx)
          continue
        }

        if (wishlist.eventIds.length === 1 && wishlist.items.length > 0) {
          throw new ConflictException(
            'You cannot remove this attendee from the event because he have a list in this event and the list have only this event attached',
          )
        }

        await this.wishlistRepository.delete(wishlist.id, tx)
      }
    })
  }
}
