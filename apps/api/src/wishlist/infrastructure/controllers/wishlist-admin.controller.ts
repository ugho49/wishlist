import { Controller, Get, Query } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { ApiTags } from '@nestjs/swagger'
import { DEFAULT_RESULT_NUMBER } from '@wishlist/api/core'
import { GetAllWishlistsPaginationQueryDto, PagedResponse, WishlistWithEventsDto } from '@wishlist/common'

import { IsAdmin } from '../../../auth'
import { GetWishlistsByOwnerQuery } from '../../domain'

@IsAdmin()
@ApiTags('ADMIN - Wishlist')
@Controller('/admin/wishlist')
export class WishlistAdminController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  getAllPaginated(
    @Query() queryParams: GetAllWishlistsPaginationQueryDto,
  ): Promise<PagedResponse<WishlistWithEventsDto>> {
    return this.queryBus.execute(
      new GetWishlistsByOwnerQuery({
        ownerId: queryParams.user_id,
        pageNumber: queryParams.p ?? 1,
        pageSize: DEFAULT_RESULT_NUMBER,
      }),
    )
  }
}
