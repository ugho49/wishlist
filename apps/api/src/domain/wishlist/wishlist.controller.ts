import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { CurrentUser, ICurrentUser } from '../auth';
import {
  CreateWishlistInputDto,
  DetailedWishlistDto,
  GetPaginationQueryDto,
  LinkUnlinkWishlistInputDto,
  MiniWishlistDto,
  PagedResponse,
  UpdateWishlistInputDto,
  WishlistWithEventsDto,
} from '@wishlist/common-types';

@ApiTags('Wishlist')
@Controller('/wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  getMyWishlists(
    @Query() queryParams: GetPaginationQueryDto,
    @CurrentUser('id') currentUserId: string
  ): Promise<PagedResponse<WishlistWithEventsDto>> {
    return this.wishlistService.getMyWishlistPaginated({ pageNumber: queryParams.p, currentUserId });
  }

  @Get('/:id')
  getWishlistById(
    @Param('id') wishlistId: string,
    @CurrentUser('id') currentUserId: string
  ): Promise<DetailedWishlistDto> {
    return this.wishlistService.findById({ wishlistId, currentUserId });
  }

  @Post()
  createWishlist(
    @CurrentUser('id') currentUserId: string,
    @Body() dto: CreateWishlistInputDto
  ): Promise<MiniWishlistDto> {
    return this.wishlistService.create({ dto, currentUserId });
  }

  @Put('/:id')
  updateWishlist(
    @Param('id') wishlistId: string,
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: UpdateWishlistInputDto
  ): Promise<void> {
    return this.wishlistService.updateWishlist({ wishlistId, currentUser, dto });
  }

  @Delete('/:id')
  deleteWishlist(@Param('id') wishlistId: string, @CurrentUser() currentUser: ICurrentUser): Promise<void> {
    return this.wishlistService.deleteWishlist({ wishlistId, currentUser });
  }

  @Post('/:id/link-event')
  @ApiOperation({ summary: 'This endpoint has for purpose to link a wishlist for a given event' })
  linkWishlistToAnEvent(
    @Param('id') wishlistId: string,
    @Body() dto: LinkUnlinkWishlistInputDto,
    @CurrentUser('id') currentUserId: string
  ): Promise<void> {
    return this.wishlistService.linkWishlistToAnEvent({ wishlistId, currentUserId, eventId: dto.event_id });
  }

  @Post('/:id/unlink-event')
  @ApiOperation({ summary: 'This endpoint has for purpose to unlink a wishlist for a given event' })
  unlinkWishlistToAnEvent(
    @Param('id') wishlistId: string,
    @Body() dto: LinkUnlinkWishlistInputDto,
    @CurrentUser('id') currentUserId: string
  ): Promise<void> {
    return this.wishlistService.unlinkWishlistToAnEvent({ wishlistId, currentUserId, eventId: dto.event_id });
  }
}
