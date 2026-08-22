import type { WishlistItemRepository } from '../../domain/wishlist-item.repository';

import { Inject, Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { type ICurrentUser, type ItemId, type ItemTakerDto, ToggleItemOutputDto } from '@wishlist/common';

import { REPOSITORIES } from '../../../repositories/repositories.constants';
import { type UserRepository } from '../../../user/domain/repository/user.repository';
import { userMapper } from '../../../user/infrastructure/user.mapper';
import { Wishlist } from '../../../wishlist/domain/wishlist.model';
import { type WishlistRepository } from '../../../wishlist/domain/wishlist.repository';
import { WishlistItem } from '../../domain/wishlist-item.model';

export type ToggleItemInput = {
  currentUser: ICurrentUser;
  itemId: ItemId;
};

@Injectable()
export class ToggleItemUseCase {
  private readonly logger = new Logger(ToggleItemUseCase.name);

  constructor(
    @Inject(REPOSITORIES.WISHLIST_ITEM) private readonly itemRepository: WishlistItemRepository,
    @Inject(REPOSITORIES.WISHLIST) private readonly wishlistRepository: WishlistRepository,
    @Inject(REPOSITORIES.USER) private readonly userRepository: UserRepository,
  ) {}

  async execute(command: ToggleItemInput): Promise<ToggleItemOutputDto> {
    this.logger.log('Toggle item request received', { command });
    const item = await this.itemRepository.findByIdOrFail(command.itemId);
    const hasAccess = await this.wishlistRepository.hasAccess({
      wishlistId: item.wishlistId,
      userId: command.currentUser.id,
    });

    if (!hasAccess) {
      throw new UnauthorizedException(
        'You cannot toggle this item, you are not the owner of the list or a participant',
      );
    }

    const wishlist = await this.wishlistRepository.findByIdOrFail(item.wishlistId);

    const updatedItem = item.isTakenBy(command.currentUser.id)
      ? await this.uncheck({ item, wishlist, currentUser: command.currentUser })
      : await this.check({ item, wishlist, currentUser: command.currentUser });

    return {
      takers: ToggleItemUseCase.toTakerDtos(updatedItem),
    };
  }

  private async check(params: {
    item: WishlistItem;
    wishlist: Wishlist;
    currentUser: ICurrentUser;
  }): Promise<WishlistItem> {
    this.logger.log('Checking item...', { itemId: params.item.id });
    const { item, currentUser, wishlist } = params;

    if (wishlist.isOwner(currentUser.id) && wishlist.hideItems) {
      if (item.isSuggested) {
        throw new NotFoundException('Item not found');
      }

      throw new UnauthorizedException('You cannot check your own items');
    }

    const user = await this.userRepository.findByIdOrFail(currentUser.id);
    const updatedItem = item.check(user);

    await this.itemRepository.save(updatedItem);

    return updatedItem;
  }

  private async uncheck(params: {
    item: WishlistItem;
    wishlist: Wishlist;
    currentUser: ICurrentUser;
  }): Promise<WishlistItem> {
    this.logger.log('Unchecking item...', { itemId: params.item.id });
    const { item, wishlist, currentUser } = params;

    if (wishlist.isOwner(currentUser.id) && wishlist.hideItems) {
      if (item.isSuggested) {
        throw new NotFoundException('Item not found');
      }

      throw new UnauthorizedException('You cannot uncheck your own items');
    }

    const updatedItem = item.uncheck(currentUser.id);

    await this.itemRepository.save(updatedItem);

    return updatedItem;
  }

  private static toTakerDtos(item: WishlistItem): ItemTakerDto[] {
    return item.takers.map(taker => ({
      user: userMapper.toMiniUserDto(taker.user),
      taken_at: taker.takenAt.toISOString(),
    }));
  }
}
