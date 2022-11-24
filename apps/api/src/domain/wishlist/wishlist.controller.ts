import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { CurrentUser, ICurrentUser } from '../auth';
import {
  CreateWishlistInputDto,
  DetailedWishlistDto,
  GetPaginationQueryDto,
  MiniWishlistDto,
  PagedResponse,
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

  @Delete('/:id')
  deleteWishlist(@Param('id') wishlistId: string, @CurrentUser() currentUser: ICurrentUser): Promise<void> {
    return this.wishlistService.deleteWishlist({ wishlistId, currentUser });
  }
}
