import { Inject, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { AttendeeRepository } from '@wishlist/api/attendee'
import { BucketService } from '@wishlist/api/core'
import { Event, EventRepository } from '@wishlist/api/event'
import { ATTENDEE_REPOSITORY, EVENT_REPOSITORY, USER_REPOSITORY, WISHLIST_REPOSITORY } from '@wishlist/api/repositories'
import { UserRepository } from '@wishlist/api/user'
import { uniq } from 'lodash'

import { CreateWishlistCommand, CreateWishlistResult, Wishlist, WishlistRepository } from '../../domain'
import { wishlistMapper } from '../../infrastructure'

@CommandHandler(CreateWishlistCommand)
export class CreateWishlistUseCase implements IInferredCommandHandler<CreateWishlistCommand> {
  constructor(
    @Inject(WISHLIST_REPOSITORY) private readonly wishlistRepository: WishlistRepository,
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: EventRepository,
    @Inject(ATTENDEE_REPOSITORY) private readonly attendeeRepository: AttendeeRepository,
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly bucketService: BucketService,
  ) {}

  async execute(command: CreateWishlistCommand): Promise<CreateWishlistResult> {
    const eventIds = uniq(command.newWishlist.eventIds)

    for (const eventId of eventIds) {
      const eventAttendees = await this.attendeeRepository.findByEventId(eventId)

      if (!Event.canAddWishlist({ currentUserId: command.currentUser.id, attendees: eventAttendees })) {
        throw new UnauthorizedException(`You cannot add the wishlist to the event ${eventId}`)
      }
    }

    const owner = await this.userRepository.findByIdOrFail(command.currentUser.id)

    let wishlist = Wishlist.create({
      title: command.newWishlist.title,
      description: command.newWishlist.description,
      owner,
      eventIds,
      hideItems: command.newWishlist.hideItems === undefined ? true : command.newWishlist.hideItems,
    })

    if (command.newWishlist.imageFile) {
      const fileDestination = this.bucketService.getLogoDestination(wishlist.id)
      const logoUrl = await this.bucketService.uploadFile({
        destination: fileDestination,
        file: command.newWishlist.imageFile,
      })

      wishlist = wishlist.updateLogoUrl(logoUrl)
    }

    await this.wishlistRepository.save(wishlist)

    const events = await this.eventRepository.findByIds(eventIds)

    return wishlistMapper.toDetailedWishlistDto({
      wishlist,
      currentUserId: command.currentUser.id,
      events,
    })
  }
}
