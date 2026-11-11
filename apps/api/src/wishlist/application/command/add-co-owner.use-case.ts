import type { WishlistRepository } from '../../domain/wishlist.repository';

import { type ICurrentUser, type UserId, type WishlistId } from '@wishlist/common';
import { Injectable } from '@znight/core';
import { EventPublisher } from '@znight/events';
import { BadRequestException, UnauthorizedException } from '@znight/http';
import { getLogger } from '@znight/observability';

import { type UserRepository } from '../../../user/domain/repository/user.repository';
import { UserAddedAsCoOwnerToWishlistEvent } from '../../domain/event/user-added-as-co-owner-to-wishlist.event';

export type AddCoOwnerInput = {
  currentUser: ICurrentUser;
  wishlistId: WishlistId;
  coOwnerId: UserId;
};

@Injectable()
export class AddCoOwnerUseCase {
  private readonly logger = getLogger(AddCoOwnerUseCase.name);

  constructor(
    private readonly wishlistRepository: WishlistRepository,
    private readonly userRepository: UserRepository,
    private readonly eventBus: EventPublisher,
  ) {}

  async execute(command: AddCoOwnerInput): Promise<void> {
    this.logger.info('Add co-owner request received', { command });
    const wishlist = await this.wishlistRepository.findByIdOrFail(command.wishlistId);

    // Only the owner can add a co-owner
    if (!wishlist.isOwner(command.currentUser.id)) {
      throw new UnauthorizedException('Only the owner can add a co-owner');
    }

    // Cannot add co-owner to private lists
    if (wishlist.hideItems) {
      throw new BadRequestException('Cannot add co-owner to private lists');
    }

    // Cannot add the owner as co-owner
    if (wishlist.isOwner(command.coOwnerId)) {
      throw new BadRequestException('Cannot add the owner as co-owner');
    }

    // Fetch the co-owner user
    const coOwner = await this.userRepository.findByIdOrFail(command.coOwnerId);

    const updatedWishlist = wishlist.addCoOwner(coOwner);

    this.logger.info('Saving wishlist...', { wishlistId: updatedWishlist.id, updatedFields: ['coOwner'] });
    await this.wishlistRepository.save(updatedWishlist);

    await this.eventBus.publish(new UserAddedAsCoOwnerToWishlistEvent({ wishlist: updatedWishlist, coOwner }));
  }
}
