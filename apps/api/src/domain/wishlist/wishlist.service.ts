import { Injectable, Logger, NotFoundException, UnauthorizedException } from '@nestjs/common'
import {
  createPagedResponse,
  CreateWishlistInputDto,
  DetailedWishlistDto,
  EventId,
  ICurrentUser,
  MAX_EVENTS_BY_LIST,
  MiniWishlistDto,
  PagedResponse,
  UpdateWishlistInputDto,
  UpdateWishlistLogoOutputDto,
  UserId,
  uuid,
  WishlistId,
  WishlistWithEventsDto,
} from '@wishlist/common'
import { uniq } from 'lodash'

import { DEFAULT_RESULT_NUMBER } from '../../common'
import { BucketService } from '../../core/bucket/bucket.service'
import { EventRepository } from '../event/event.repository'
import { ItemEntity } from '../item/item.entity'
import { WishlistEntity } from './wishlist.entity'
import { toDetailedWishlistDto, toMiniWishlistDto, toWishlistWithEventsDto } from './wishlist.mapper'
import { WishlistRepository } from './wishlist.repository'

@Injectable()
export class WishlistService {
  private readonly logger = new Logger(WishlistService.name)

  constructor(
    private readonly wishlistRepository: WishlistRepository,
    private readonly eventRepository: EventRepository,
    private readonly bucketService: BucketService,
  ) {}

  async findById(param: { currentUserId: UserId; wishlistId: WishlistId }): Promise<DetailedWishlistDto> {
    const entity = await this.wishlistRepository.findByIdAndUserId({
      userId: param.currentUserId,
      wishlistId: param.wishlistId,
    })

    if (!entity) {
      throw new NotFoundException('Wishlist not found')
    }

    return toDetailedWishlistDto({ entity, currentUserId: param.currentUserId })
  }

  async getAllWishlistForUserPaginated(param: {
    userId: UserId
    pageNumber: number
  }): Promise<PagedResponse<WishlistWithEventsDto>> {
    const pageSize = DEFAULT_RESULT_NUMBER
    const { pageNumber, userId } = param
    const skip = pageSize * (pageNumber - 1)

    const [entities, totalElements] = await this.wishlistRepository.getAllWishlistForUserPaginated({
      ownerId: userId,
      take: pageSize,
      skip,
    })

    const dtos = await Promise.all(entities.map(entity => toWishlistWithEventsDto(entity)))

    return createPagedResponse({
      resources: dtos,
      options: { pageSize, totalElements, pageNumber },
    })
  }

  async create(params: {
    currentUserId: UserId
    dto: CreateWishlistInputDto
    imageFile?: Express.Multer.File
  }): Promise<MiniWishlistDto> {
    const { currentUserId, dto, imageFile } = params
    const eventIds = uniq(dto.event_ids)
    const eventEntities = await this.eventRepository.findByIdsAndUserId({
      eventIds: eventIds,
      userId: currentUserId,
    })

    if (eventEntities.length !== eventIds.length) {
      throw new UnauthorizedException('You cannot add the wishlist to one or more events')
    }

    const wishlistEntity = WishlistEntity.create({
      title: dto.title,
      description: dto.description,
      ownerId: currentUserId,
      hideItems: dto.hide_items === undefined ? true : dto.hide_items,
    })

    const itemEntities = dto.items.map(item =>
      ItemEntity.create({
        name: item.name,
        description: item.description,
        url: item.url,
        score: item.score,
        isSuggested: false,
        wishlistId: wishlistEntity.id,
      }),
    )

    const fileDestination = this.getLogoDestination(wishlistEntity.id)
    if (imageFile) {
      wishlistEntity.logoUrl = await this.uploadToBucket(fileDestination, imageFile)
    }

    try {
      wishlistEntity.events = Promise.resolve(eventEntities)
      wishlistEntity.items = Promise.resolve(itemEntities)

      await this.wishlistRepository.transaction(async em => {
        await em.save(wishlistEntity)
        await em.save(itemEntities)

        for (const eventEntity of eventEntities) {
          await this.wishlistRepository.linkEvent({
            wishlistId: wishlistEntity.id,
            eventId: eventEntity.id,
            em,
          })
        }
      })
    } catch (e) {
      if (imageFile) {
        await this.bucketService.removeIfExist({ destination: fileDestination })
      }
      throw e
    }

    return toMiniWishlistDto(wishlistEntity)
  }

  async updateWishlist(param: {
    currentUser: ICurrentUser
    wishlistId: WishlistId
    dto: UpdateWishlistInputDto
  }): Promise<void> {
    const { currentUser, wishlistId, dto } = param

    const entity = await this.wishlistRepository.findByIdOrThrow(wishlistId)
    const isOwner = entity.ownerId === currentUser.id

    if (!isOwner) {
      throw new UnauthorizedException('Only the owner of the list can update it')
    }

    await this.wishlistRepository.update(
      { id: wishlistId },
      {
        title: dto.title,
        description: dto.description || null,
      },
    )
  }

  async deleteWishlist(param: { currentUser: ICurrentUser; wishlistId: WishlistId }): Promise<void> {
    const { currentUser, wishlistId } = param
    const entity = await this.wishlistRepository.findByIdOrThrow(wishlistId)
    const userCanDeleteList = entity.ownerId === currentUser.id || currentUser.isAdmin

    if (!userCanDeleteList) {
      throw new UnauthorizedException('Only the owner of the list can delete it')
    }

    await this.wishlistRepository.delete({ id: wishlistId })

    const logoDest = this.getLogoDestination(wishlistId)
    await this.bucketService.removeIfExist({ destination: logoDest })
  }

  async linkWishlistToAnEvent(param: {
    eventId: EventId
    currentUserId: UserId
    wishlistId: WishlistId
  }): Promise<void> {
    const { currentUserId, wishlistId, eventId } = param

    const wishlistEntity = await this.wishlistRepository.findByIdOrThrow(wishlistId)
    const isOwner = wishlistEntity.ownerId === currentUserId

    if (!isOwner) {
      throw new UnauthorizedException('Only the owner of the list can update it')
    }

    const events = await wishlistEntity.events
    const eventIds = events.map(e => e.id)

    if (eventIds.length === MAX_EVENTS_BY_LIST) {
      throw new UnauthorizedException(`You cannot link your list to more than ${MAX_EVENTS_BY_LIST} events`)
    }

    const eventEntity = await this.eventRepository.findByIdAndUserId({ eventId, userId: currentUserId })

    if (!eventEntity) {
      throw new NotFoundException('Event not found')
    }

    if (eventIds.includes(eventId)) {
      throw new UnauthorizedException('This wishlist is already attached to this event')
    }

    await this.wishlistRepository.linkEvent({ wishlistId, eventId })
  }

  async unlinkWishlistToAnEvent(param: {
    eventId: EventId
    currentUserId: UserId
    wishlistId: WishlistId
  }): Promise<void> {
    const { currentUserId, wishlistId, eventId } = param

    const wishlistEntity = await this.wishlistRepository.findByIdOrThrow(wishlistId)
    const isOwner = wishlistEntity.ownerId === currentUserId

    if (!isOwner) {
      throw new UnauthorizedException('Only the owner of the list can update it')
    }

    const events = await wishlistEntity.events
    const eventIds = events.map(e => e.id)

    if (!eventIds.includes(eventId)) {
      throw new UnauthorizedException('This wishlist is not attach to this event')
    }

    if (eventIds.length === 1) {
      throw new UnauthorizedException(
        'You cannot unlink this wishlist for this event, because she have only one event. However you can delete it if you want.',
      )
    }

    await this.wishlistRepository.unlinkEvent({ wishlistId, eventId })
  }

  async uploadLogo(param: {
    currentUserId: UserId
    file: Express.Multer.File
    wishlistId: WishlistId
  }): Promise<UpdateWishlistLogoOutputDto> {
    const { currentUserId, wishlistId, file } = param
    const wishlistEntity = await this.wishlistRepository.findByIdOrThrow(wishlistId)
    const isOwner = wishlistEntity.ownerId === currentUserId
    const destination = this.getLogoDestination(wishlistId)

    if (!isOwner) {
      throw new UnauthorizedException('Only the owner of the list can upload a logo')
    }

    try {
      await this.bucketService.removeIfExist({ destination })
    } catch (e) {
      this.logger.error('Fail to delete existing logo for wishlist', wishlistId, e)
    }

    const publicUrl = await this.uploadToBucket(destination, file)

    await this.wishlistRepository.update({ id: wishlistId }, { logoUrl: publicUrl })

    return {
      logo_url: publicUrl,
    }
  }

  async removeLogo(param: { currentUserId: UserId; wishlistId: WishlistId }): Promise<void> {
    const { currentUserId, wishlistId } = param
    const wishlistEntity = await this.wishlistRepository.findByIdOrThrow(wishlistId)
    const isOwner = wishlistEntity.ownerId === currentUserId
    const destination = `pictures/wishlists/${wishlistId}/logo`

    if (!isOwner) {
      throw new UnauthorizedException('Only the owner of the list can remove a logo')
    }

    await this.bucketService.removeIfExist({ destination })

    await this.wishlistRepository.update({ id: wishlistId }, { logoUrl: null })
  }

  private getLogoDestination(wishlistId: WishlistId) {
    return `pictures/wishlists/${wishlistId}/logo`
  }

  private async uploadToBucket(destination: string, file: Express.Multer.File) {
    return await this.bucketService.upload({
      destination: `${destination}/${uuid()}`,
      data: file.buffer,
      contentType: file.mimetype,
    })
  }
}
