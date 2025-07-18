import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger'
import { DEFAULT_RESULT_NUMBER } from '@wishlist/api/core'
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
import {
  CreateWishlistCommand,
  DeleteWishlistCommand,
  GetWishlistByIdQuery,
  GetWishlistsByOwnerQuery,
  LinkWishlistToEventCommand,
  RemoveWishlistLogoCommand,
  UnlinkWishlistFromEventCommand,
  UpdateWishlistCommand,
  UploadWishlistLogoCommand,
} from '../../domain'
import { wishlistLogoFileValidators, wishlistLogoResizePipe } from '../wishlist.validator'

@ApiTags('Wishlist')
@Controller('/wishlist')
export class WishlistController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  getMyWishlists(
    @Query() queryParams: GetPaginationQueryDto,
    @CurrentUser('id') currentUserId: UserId,
  ): Promise<PagedResponse<WishlistWithEventsDto>> {
    return this.queryBus.execute(
      new GetWishlistsByOwnerQuery({
        ownerId: currentUserId,
        pageNumber: queryParams.p ?? 1,
        pageSize: DEFAULT_RESULT_NUMBER,
      }),
    )
  }

  @Get('/:id')
  getWishlistById(
    @Param('id') wishlistId: WishlistId,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<DetailedWishlistDto> {
    return this.queryBus.execute(new GetWishlistByIdQuery({ wishlistId, currentUser }))
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  createWishlistWithLogo(
    @CurrentUser() currentUser: ICurrentUser,
    @ValidJsonBody('data') dto: CreateWishlistInputDto,
    @UploadedFile(wishlistLogoFileValidators(false), wishlistLogoResizePipe(false))
    imageFile?: Express.Multer.File,
  ): Promise<DetailedWishlistDto> {
    return this.commandBus.execute(
      new CreateWishlistCommand({
        currentUser,
        newWishlist: {
          title: dto.title,
          description: dto.description,
          eventIds: dto.event_ids,
          hideItems: dto.hide_items,
          imageFile,
        },
      }),
    )
  }

  @Put('/:id')
  updateWishlist(
    @Param('id') wishlistId: WishlistId,
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: UpdateWishlistInputDto,
  ): Promise<void> {
    return this.commandBus.execute(
      new UpdateWishlistCommand({
        wishlistId,
        currentUser,
        updateWishlist: {
          title: dto.title,
          description: dto.description,
        },
      }),
    )
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
    @CurrentUser() currentUser: ICurrentUser,
    @UploadedFile(wishlistLogoFileValidators(true), wishlistLogoResizePipe(true))
    file: Express.Multer.File,
  ): Promise<UpdateWishlistLogoOutputDto> {
    return this.commandBus.execute(new UploadWishlistLogoCommand({ wishlistId, currentUser, file }))
  }

  @Delete('/:id/logo')
  async removeLogo(@Param('id') wishlistId: WishlistId, @CurrentUser() currentUser: ICurrentUser): Promise<void> {
    await this.commandBus.execute(new RemoveWishlistLogoCommand({ wishlistId, currentUser }))
  }
}
