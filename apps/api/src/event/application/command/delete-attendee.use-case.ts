import { ConflictException, Inject, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { TransactionManager } from '@wishlist/api/core'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { WishlistRepository } from '@wishlist/api/wishlist'

import { DeleteAttendeeCommand, EventAttendeeRepository, EventRepository } from '../../domain'

@CommandHandler(DeleteAttendeeCommand)
export class DeleteAttendeeUseCase implements IInferredCommandHandler<DeleteAttendeeCommand> {
  private readonly logger = new Logger(DeleteAttendeeUseCase.name)

  constructor(
    @Inject(REPOSITORIES.EVENT_ATTENDEE)
    private readonly attendeeRepository: EventAttendeeRepository,
    @Inject(REPOSITORIES.EVENT)
    private readonly eventRepository: EventRepository,
    @Inject(REPOSITORIES.WISHLIST)
    private readonly wishlistRepository: WishlistRepository,
    private readonly transactionManager: TransactionManager,
  ) {}

  async execute(command: DeleteAttendeeCommand) {
    this.logger.log('Delete attendee request received', { command })
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

    const attendeeUserId = attendee.user?.id

    const attendeeWishlistsForEvent =
      attendeeUserId === undefined
        ? []
        : (await this.wishlistRepository.findByEvent(attendee.eventId)).filter(wishlist =>
            wishlist.isOwner(attendeeUserId),
          )

    await this.transactionManager.runInTransaction(async tx => {
      this.logger.log('Removing attendee from event...', { attendeeId, eventId })
      // Remove the attendee from the event
      await this.attendeeRepository.delete(attendeeId, tx)

      this.logger.log('Checking wishlists where the attendee is the owner...', { eventId, attendeeId })
      // Check if this is ok for the wishlists
      for (const wishlist of attendeeWishlistsForEvent) {
        if (wishlist.eventIds.length > 1) {
          this.logger.log('Unlinking event from wishlist...', { wishlistId: wishlist.id, eventId: attendee.eventId })
          const updatedWishlist = wishlist.unlinkEvent(attendee.eventId)
          await this.wishlistRepository.save(updatedWishlist, tx)
          continue
        }

        if (wishlist.eventIds.length === 1 && wishlist.items.length > 0) {
          throw new ConflictException(
            'You cannot remove this attendee from the event because he have a list in this event and the list have only this event attached',
          )
        }

        this.logger.log('Deleting wishlist...', { wishlistId: wishlist.id })
        await this.wishlistRepository.delete(wishlist.id, tx)
      }
    })
  }
}
