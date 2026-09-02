import type { WishlistRepository } from '../../domain/wishlist.repository';

import { Inject, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { type EventId, type ICurrentUser } from '@wishlist/common';
import { uniq } from 'lodash';

import { BucketService } from '../../../core/bucket/bucket.service';
import { type EventRepository } from '../../../event/domain/repository/event.repository';
import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { type UserRepository } from '../../../user/domain/repository/user.repository';
import { Wishlist } from '../../domain/wishlist.model';

export type CreateWishlistInput = {
  currentUser: ICurrentUser;
  newWishlist: {
    title: string;
    description?: string;
    eventIds: EventId[];
    hideItems?: boolean;
    imageFile?: Express.Multer.File;
  };
};

@Injectable()
export class CreateWishlistUseCase {
  private readonly logger = new Logger(CreateWishlistUseCase.name);

  constructor(
    @Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository,
    @Inject(REPOSITORIES.EVENT) private readonly eventRepository: EventRepository,
    @Inject(REPOSITORIES.USER) private readonly userRepository: UserRepository,
    private readonly bucketService: BucketService,
  ) {}

  async execute(command: CreateWishlistInput): Promise<Wishlist> {
    this.logger.log('Create wishlist request received', { command });

    const eventIds = uniq(command.newWishlist.eventIds);
    const events = await this.eventRepository.findByIds(eventIds);

    if (events.length !== eventIds.length) {
      throw new NotFoundException('One or more events not found');
    }

    for (const event of events) {
      if (!event.canAddWishlist(command.currentUser.id)) {
        throw new UnauthorizedException(`You cannot add the wishlist to the event ${event.id}`);
      }
    }

    const owner = await this.userRepository.findByIdOrFail(command.currentUser.id);

    let wishlist = Wishlist.create({
      id: this.wishlistRepository.newId(),
      title: command.newWishlist.title,
      description: command.newWishlist.description,
      ownerId: owner.id,
      eventIds,
      hideItems: command.newWishlist.hideItems === undefined ? true : command.newWishlist.hideItems,
    });

    if (command.newWishlist.imageFile) {
      const fileDestination = this.bucketService.getLogoDestination(wishlist.id);
      const logoUrl = await this.bucketService.uploadFile({
        destination: fileDestination,
        file: command.newWishlist.imageFile,
      });

      wishlist = wishlist.updateLogoUrl(logoUrl);
    }

    this.logger.log('Saving wishlist...', { wishlistId: wishlist.id });
    await this.wishlistRepository.save(wishlist);

    return wishlist;
  }
}
