import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { LegacyWishlistRepository, WishlistEntity } from '@wishlist/api/wishlist'
import { AttendeeId, ICurrentUser } from '@wishlist/common'

import { AttendeeEntity } from './legacy-attendee.entity'
import { LegacyAttendeeRepository } from './legacy-attendee.repository'

@Injectable()
export class LegacyAttendeeService {
  constructor(
    private readonly attendeeRepository: LegacyAttendeeRepository,
    private readonly wishlistRepository: LegacyWishlistRepository,
  ) {}

  async deleteAttendee(param: { currentUser: ICurrentUser; attendeeId: AttendeeId }): Promise<void> {
    const { attendeeId, currentUser } = param
    const attendeeEntity = await this.attendeeRepository.findOneBy({ id: attendeeId })

    if (!attendeeEntity) {
      throw new NotFoundException('Attendee not found')
    }

    const eventEntity = await attendeeEntity.event
    const canEdit = await eventEntity.canEdit(currentUser)

    if (!canEdit) {
      throw new UnauthorizedException('Only maintainers of the event can delete an attendee')
    }

    if (attendeeEntity.userId === currentUser.id) {
      throw new ConflictException('You cannot delete yourself from the event')
    }

    const event = await attendeeEntity.event
    const wishlists = await event.wishlists.then(wishlists =>
      wishlists.filter(wishlist => wishlist.ownerId === attendeeEntity.userId),
    )

    await this.attendeeRepository.transaction(async em => {
      for (const wishlist of wishlists) {
        const [events, items] = await Promise.all([wishlist.events, wishlist.items])

        if (events.length > 1) {
          await this.wishlistRepository.unlinkEvent({ wishlistId: wishlist.id, eventId: event.id, em })
          continue
        }

        if (events.length === 1 && items.length > 0) {
          throw new ConflictException(
            'You remove this attendee from the event because he have a list in this event and the list have only this event attached',
          )
        }

        await em.delete(WishlistEntity, { id: wishlist.id })
      }

      await em.delete(AttendeeEntity, { id: attendeeId })
    })
  }
}
