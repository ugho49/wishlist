import { Inject, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { CommandHandler, IInferredCommandHandler } from '@nestjs/cqrs'
import { BucketService } from '@wishlist/api/core'
import { EventRepository } from '@wishlist/api/event'
import { REPOSITORIES } from '@wishlist/api/repositories'
import { UserRepository } from '@wishlist/api/user'
import { uniq } from 'lodash'

import { CreateWishlistCommand, CreateWishlistResult, Wishlist, WishlistRepository } from '../../domain'
import { wishlistMapper } from '../../infrastructure'

@CommandHandler(CreateWishlistCommand)
export class CreateWishlistUseCase implements IInferredCommandHandler<CreateWishlistCommand> {
  private readonly logger = new Logger(CreateWishlistUseCase.name)

  constructor(
    @Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository,
    @Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository,
    @Inject(REPOSITORIES.USER) private readonly userRepository: UserRepository,
    private readonly bucketService: BucketService,
  ) {}

  async execute(command: CreateWishlistCommand): Promise<CreateWishlistResult> {
    this.logger.log('Starting to create wishlist', { newWishlist: command.newWishlist })

    const eventIds = uniq(command.newWishlist.eventIds)
    const events = await this.eventRepository.findByIds(eventIds)

    if (events.length !== eventIds.length) {
      throw new NotFoundException('One or more events not found')
    }

    for (const event of events) {
      if (!event.canAddWishlist(command.currentUser.id)) {
        throw new UnauthorizedException(`You cannot add the wishlist to the event ${event.id}`)
      }
    }

    const owner = await this.userRepository.findByIdOrFail(command.currentUser.id)

    let wishlist = Wishlist.create({
      id: this.wishlistRepository.newId(),
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

    return wishlistMapper.toDetailedWishlistDto({
      wishlist,
      currentUserId: command.currentUser.id,
      events,
    })
  }
}
