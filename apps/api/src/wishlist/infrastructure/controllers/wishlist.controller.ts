import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common'
import { CommandBus } from '@nestjs/cqrs'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger'
import {
  CreateWishlistInputDto,
  DetailedWishlistDto,
  GetPaginationQueryDto,
  ICurrentUser,
  LinkUnlinkWishlistInputDto,
  PagedResponse,
  UpdateWishlistInputDto,
  UpdateWishlistLogoOutputDto,
  UserId,
  WishlistId,
  WishlistWithEventsDto,
} from '@wishlist/common'

import { CurrentUser } from '../../../auth'
import { ValidJsonBody } from '../../../core/common/common.decorator'
import { DeleteWishlistCommand, LinkWishlistToEventCommand, UnlinkWishlistFromEventCommand } from '../../domain'
import { LegacyWishlistService } from '../legacy-wishlist.service'
import { wishlistLogoFileValidators, wishlistLogoResizePipe } from '../wishlist.validator'

@ApiTags('Wishlist')
@Controller('/wishlist')
export class WishlistController {
  constructor(
    private readonly wishlistService: LegacyWishlistService,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  getMyWishlists(
    @Query() queryParams: GetPaginationQueryDto,
    @CurrentUser('id') currentUserId: UserId,
  ): Promise<PagedResponse<WishlistWithEventsDto>> {
    return this.wishlistService.getAllWishlistForUserPaginated({
      pageNumber: queryParams.p || 1,
      userId: currentUserId,
    })
  }

  @Get('/:id')
  getWishlistById(
    @Param('id') wishlistId: WishlistId,
    @CurrentUser('id') currentUserId: UserId,
  ): Promise<DetailedWishlistDto> {
    return this.wishlistService.findById({ wishlistId, currentUserId })
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  createWishlistWithLogo(
    @CurrentUser('id') currentUserId: UserId,
    @ValidJsonBody('data') dto: CreateWishlistInputDto,
    @UploadedFile(wishlistLogoFileValidators(false), wishlistLogoResizePipe(false))
    imageFile?: Express.Multer.File,
  ): Promise<unknown> {
    return this.wishlistService.create({ dto, currentUserId, imageFile })
  }

  @Put('/:id')
  updateWishlist(
    @Param('id') wishlistId: WishlistId,
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: UpdateWishlistInputDto,
  ): Promise<void> {
    return this.wishlistService.updateWishlist({ wishlistId, currentUser, dto })
  }

  @Delete('/:id')
  async deleteWishlist(@Param('id') wishlistId: WishlistId, @CurrentUser() currentUser: ICurrentUser): Promise<void> {
    await this.commandBus.execute(new DeleteWishlistCommand({ wishlistId, currentUser }))
  }

  @Post('/:id/link-event')
  @ApiOperation({ summary: 'This endpoint has for purpose to link a wishlist for a given event' })
  async linkWishlistToAnEvent(
    @Param('id') wishlistId: WishlistId,
    @Body() dto: LinkUnlinkWishlistInputDto,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<void> {
    await this.commandBus.execute(new LinkWishlistToEventCommand({ wishlistId, currentUser, eventId: dto.event_id }))
  }

  @Post('/:id/unlink-event')
  @ApiOperation({ summary: 'This endpoint has for purpose to unlink a wishlist for a given event' })
  async unlinkWishlistToAnEvent(
    @Param('id') wishlistId: WishlistId,
    @Body() dto: LinkUnlinkWishlistInputDto,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<void> {
    await this.commandBus.execute(
      new UnlinkWishlistFromEventCommand({ wishlistId, currentUser, eventId: dto.event_id }),
    )
  }

  @Post('/:id/upload-logo')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(
    @Param('id') wishlistId: WishlistId,
    @CurrentUser('id') currentUserId: UserId,
    @UploadedFile(wishlistLogoFileValidators(true), wishlistLogoResizePipe(true))
    file: Express.Multer.File,
  ): Promise<UpdateWishlistLogoOutputDto> {
    return this.wishlistService.uploadLogo({
      wishlistId,
      currentUserId,
      file,
    })
  }

  @Delete('/:id/logo')
  async removeLogo(@Param('id') wishlistId: WishlistId, @CurrentUser('id') currentUserId: UserId): Promise<void> {
    await this.wishlistService.removeLogo({ wishlistId, currentUserId })
  }
}
