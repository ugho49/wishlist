import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common';
import {
  createPagedResponse,
  CreateWishlistInputDto,
  DetailedWishlistDto,
  ICurrentUser,
  MAX_EVENTS_BY_LIST,
  MiniWishlistDto,
  PagedResponse,
  UpdateWishlistInputDto,
  UpdateWishlistLogoOutputDto,
  WishlistWithEventsDto,
} from '@wishlist/common-types';
import { toDetailedWishlistDto, toMiniWishlistDto, toWishlistWithEventsDto } from './wishlist.mapper';
import { DEFAULT_RESULT_NUMBER } from '@wishlist/common';
import { WishlistRepository } from './wishlist.repository';
import { EventRepository } from '../event/event.repository';
import { WishlistEntity } from './wishlist.entity';
import { ItemEntity } from '../item/item.entity';
import { BucketService } from '../../core/bucket/bucket.service';

@Injectable()
export class WishlistService {
  private readonly logger = new Logger(WishlistService.name);

  constructor(
    private readonly wishlistRepository: WishlistRepository,
    private readonly eventRepository: EventRepository,
    private readonly bucketService: BucketService,
  ) {}

  async findById(param: { currentUserId: string; wishlistId: string }): Promise<DetailedWishlistDto> {
    const entity = await this.wishlistRepository.findByIdAndUserId({
      userId: param.currentUserId,
      wishlistId: param.wishlistId,
    });

    if (!entity) {
      throw new NotFoundException('Wishlist not found');
    }

    return toDetailedWishlistDto({ entity, currentUserId: param.currentUserId });
  }

  async getMyWishlistPaginated(param: {
    currentUserId: string;
    pageNumber: number;
  }): Promise<PagedResponse<WishlistWithEventsDto>> {
    const pageSize = DEFAULT_RESULT_NUMBER;
    const { pageNumber, currentUserId } = param;
    const skip = pageSize * (pageNumber - 1);

    const [entities, totalElements] = await this.wishlistRepository.getMyWishlistPaginated({
      ownerId: currentUserId,
      take: pageSize,
      skip,
    });

    const dtos = await Promise.all(entities.map((entity) => toWishlistWithEventsDto(entity)));

    return createPagedResponse({
      resources: dtos,
      options: { pageSize, totalElements, pageNumber },
    });
  }

  async create(param: { currentUserId: string; dto: CreateWishlistInputDto }): Promise<MiniWishlistDto> {
    const { currentUserId, dto } = param;
    const eventEntities = await this.eventRepository.findByIdsAndUserId({
      eventIds: dto.event_ids,
      userId: currentUserId,
    });

    if (eventEntities.length !== dto.event_ids.length) {
      throw new UnauthorizedException('You cannot add the wishlist to one or more events');
    }

    const wishlistEntity = WishlistEntity.create({
      title: dto.title,
      description: dto.description,
      ownerId: currentUserId,
      hideItems: dto.hide_items === undefined ? true : dto.hide_items,
    });

    const itemEntities = dto.items.map((item) =>
      ItemEntity.create({
        name: item.name,
        description: item.description,
        url: item.url,
        score: item.score,
        isSuggested: false,
        wishlistId: wishlistEntity.id,
      }),
    );

    wishlistEntity.events = Promise.resolve(eventEntities);
    wishlistEntity.items = Promise.resolve(itemEntities);

    await this.wishlistRepository.save(wishlistEntity);

    return toMiniWishlistDto(wishlistEntity);
  }

  async updateWishlist(param: {
    currentUser: ICurrentUser;
    wishlistId: string;
    dto: UpdateWishlistInputDto;
  }): Promise<void> {
    const { currentUser, wishlistId, dto } = param;

    const entity = await this.wishlistRepository.findByIdOrThrow(wishlistId);
    const isOwner = entity.ownerId === currentUser.id;

    if (!isOwner) {
      throw new UnauthorizedException('Only the owner of the list can update it');
    }

    await this.wishlistRepository.update(
      { id: wishlistId },
      {
        title: dto.title,
        description: dto.description || null,
      },
    );
  }

  async deleteWishlist(param: { currentUser: ICurrentUser; wishlistId: string }): Promise<void> {
    const { currentUser, wishlistId } = param;
    const entity = await this.wishlistRepository.findByIdOrThrow(wishlistId);
    const userCanDeleteList = entity.ownerId === currentUser.id || currentUser.isAdmin;

    if (!userCanDeleteList) {
      throw new UnauthorizedException('Only the owner of the list can delete it');
    }

    await this.wishlistRepository.delete({ id: wishlistId });
  }

  async linkWishlistToAnEvent(param: { eventId: string; currentUserId: string; wishlistId: string }): Promise<void> {
    const { currentUserId, wishlistId, eventId } = param;

    const wishlistEntity = await this.wishlistRepository.findByIdOrThrow(wishlistId);
    const isOwner = wishlistEntity.ownerId === currentUserId;

    if (!isOwner) {
      throw new UnauthorizedException('Only the owner of the list can update it');
    }

    const events = await wishlistEntity.events;
    const eventIds = events.map((e) => e.id);

    if (eventIds.length === MAX_EVENTS_BY_LIST) {
      throw new UnauthorizedException(`You cannot link your list to more than ${MAX_EVENTS_BY_LIST} events`);
    }

    const eventEntity = await this.eventRepository.findByIdAndUserId({ eventId, userId: currentUserId });

    if (!eventEntity) {
      throw new NotFoundException('Event not found');
    }

    if (eventIds.includes(eventId)) {
      throw new UnauthorizedException('This wishlist is already attached to this event');
    }

    await this.wishlistRepository.linkEvent({ wishlistId, eventId });
  }

  async unlinkWishlistToAnEvent(param: { eventId: string; currentUserId: string; wishlistId: string }): Promise<void> {
    const { currentUserId, wishlistId, eventId } = param;

    const wishlistEntity = await this.wishlistRepository.findByIdOrThrow(wishlistId);
    const isOwner = wishlistEntity.ownerId === currentUserId;

    if (!isOwner) {
      throw new UnauthorizedException('Only the owner of the list can update it');
    }

    const events = await wishlistEntity.events;
    const eventIds = events.map((e) => e.id);

    if (!eventIds.includes(eventId)) {
      throw new UnauthorizedException('This wishlist is not attach to this event');
    }

    if (eventIds.length === 1) {
      throw new UnauthorizedException(
        'You cannot unlink this wishlist for this event, because she have only one event. However you can delete it if you want.',
      );
    }

    await this.wishlistRepository.unlinkEvent({ wishlistId, eventId });
  }

  async uploadLogo(param: {
    currentUserId: string;
    file: Express.Multer.File;
    wishlistId: string;
  }): Promise<UpdateWishlistLogoOutputDto> {
    const { currentUserId, wishlistId, file } = param;
    const wishlistEntity = await this.wishlistRepository.findByIdOrThrow(wishlistId);
    const isOwner = wishlistEntity.ownerId === currentUserId;
    const destination = `pictures/wishlists/${wishlistId}/logo`;

    if (!isOwner) {
      throw new UnauthorizedException('Only the owner of the list can upload a logo');
    }

    try {
      await this.bucketService.removeIfExist({ destination });
    } catch (e) {
      this.logger.error('Fail to delete existing logo for wishlist', wishlistId, e);
    }

    const publicUrl = await this.bucketService.upload({
      destination,
      data: file.buffer,
      contentType: file.mimetype,
    });

    await this.wishlistRepository.update({ id: wishlistId }, { logoUrl: publicUrl });

    return {
      logo_url: publicUrl,
    };
  }

  async removeLogo(param: { currentUserId: string; wishlistId: string }): Promise<void> {
    const { currentUserId, wishlistId } = param;
    const wishlistEntity = await this.wishlistRepository.findByIdOrThrow(wishlistId);
    const isOwner = wishlistEntity.ownerId === currentUserId;
    const destination = `pictures/wishlists/${wishlistId}/logo`;

    if (!isOwner) {
      throw new UnauthorizedException('Only the owner of the list can remove a logo');
    }

    await this.bucketService.removeIfExist({ destination });

    await this.wishlistRepository.update({ id: wishlistId }, { logoUrl: null });
  }
}
