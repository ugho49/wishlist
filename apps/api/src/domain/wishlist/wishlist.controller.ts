import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { CurrentUser } from '../auth';
import {
  DetailledWishlistDto,
  GetPaginationQueryDto,
  PagedResponse,
  WishlistWithEventsDto,
} from '@wishlist/common-types';

@ApiTags('Wishlist')
@Controller('/wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  async getMyWishlists(
    @Query() queryParams: GetPaginationQueryDto,
    @CurrentUser('id') currentUserId: string
  ): Promise<PagedResponse<WishlistWithEventsDto>> {
    return this.wishlistService.getMyWishlistPaginated({ pageNumber: queryParams.p, currentUserId });
  }

  @Get('/:id')
  async getWishlistById(
    @Param('id') wishlistId: string,
    @CurrentUser('id') currentUserId: string
  ): Promise<DetailledWishlistDto> {
    return this.wishlistService.findById({ wishlistId, currentUserId });
  }
}
