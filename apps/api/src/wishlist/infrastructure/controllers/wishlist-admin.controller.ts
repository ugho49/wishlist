import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { GetAllWishlistsPaginationQueryDto, PagedResponse, WishlistWithEventsDto } from '@wishlist/common'

import { IsAdmin } from '../../../auth'
import { WishlistService } from '../wishlist.service'

@IsAdmin()
@ApiTags('ADMIN - Wishlist')
@Controller('/admin/wishlist')
export class WishlistAdminController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  getAllPaginated(
    @Query() queryParams: GetAllWishlistsPaginationQueryDto,
  ): Promise<PagedResponse<WishlistWithEventsDto>> {
    return this.wishlistService.getAllWishlistForUserPaginated({
      pageNumber: queryParams.p || 1,
      userId: queryParams.user_id,
    })
  }
}
