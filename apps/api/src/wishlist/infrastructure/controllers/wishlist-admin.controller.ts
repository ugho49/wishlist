import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { DEFAULT_RESULT_NUMBER } from '@wishlist/api/core'
import { GetAllWishlistsPaginationQueryDto, PagedResponse, WishlistWithEventsDto } from '@wishlist/common'

import { IsAdmin } from '../../../auth'
import { GetWishlistsByOwnerUseCase } from '../../application/query/get-wishlists-by-owner.use-case'

@IsAdmin()
@ApiTags('ADMIN - Wishlist')
@Controller('/admin/wishlist')
export class WishlistAdminController {
  constructor(private readonly getWishlistsByOwnerUseCase: GetWishlistsByOwnerUseCase) {}

  @Get()
  getAllPaginated(
    @Query() queryParams: GetAllWishlistsPaginationQueryDto,
  ): Promise<PagedResponse<WishlistWithEventsDto>> {
    return this.getWishlistsByOwnerUseCase.execute({
      ownerId: queryParams.user_id,
      pageNumber: queryParams.p ?? 1,
      pageSize: DEFAULT_RESULT_NUMBER,
    })
  }
}
