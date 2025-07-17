import { ConflictException, Inject, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { TransactionManager } from '@wishlist/api/core'
import { Event } from '@wishlist/api/event'
import { ATTENDEE_REPOSITORY, WISHLIST_REPOSITORY } from '@wishlist/api/repositories'
import { WishlistRepository } from '@wishlist/api/wishlist'

import { AttendeeRepository, DeleteAttendeeCommand } from '../../domain'

@CommandHandler(DeleteAttendeeCommand)
export class DeleteAttendeeUseCase implements IInferredCommandHandler<DeleteAttendeeCommand> {
  constructor(
    @Inject(ATTENDEE_REPOSITORY)
    private readonly attendeeRepository: AttendeeRepository,
    @Inject(WISHLIST_REPOSITORY)
    private readonly wishlistRepository: WishlistRepository,
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(command: DeleteAttendeeCommand) {
    const { attendeeId, currentUser } = command

    const attendee = await this.attendeeRepository.findByIdOrFail(attendeeId)

    if (attendee.user?.id === currentUser.id) {
      throw new ConflictException('You cannot delete yourself from the event')
    }

    const eventAttendees = await this.attendeeRepository.findByEventId(attendee.eventId)

    if (!Event.canEdit({ currentUser, attendees: eventAttendees })) {
      throw new UnauthorizedException('Only maintainers of the event can delete an attendee')
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
