import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger'
import { DEFAULT_RESULT_NUMBER } from '@wishlist/api/core'
import {
  AddCoOwnerInputDto,
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
import { AddCoOwnerUseCase } from '../../application/command/add-co-owner.use-case'
import { CreateWishlistUseCase } from '../../application/command/create-wishlist.use-case'
import { DeleteWishlistUseCase } from '../../application/command/delete-wishlist.use-case'
import { LinkWishlistToEventUseCase } from '../../application/command/link-wishlist-to-event.use-case'
import { RemoveCoOwnerUseCase } from '../../application/command/remove-co-owner.use-case'
import { RemoveWishlistLogoUseCase } from '../../application/command/remove-wishlist-logo.use-case'
import { UnlinkWishlistFromEventUseCase } from '../../application/command/unlink-wishlist-from-event.use-case'
import { UpdateWishlistUseCase } from '../../application/command/update-wishlist.use-case'
import { UploadWishlistLogoUseCase } from '../../application/command/upload-wishlist-logo.use-case'
import { GetWishlistByIdUseCase } from '../../application/query/get-wishlist-by-id.use-case'
import { GetWishlistsByOwnerUseCase } from '../../application/query/get-wishlists-by-owner.use-case'
import { wishlistLogoFileValidators, wishlistLogoResizePipe } from '../wishlist.validator'

@ApiTags('Wishlist')
@Controller('/wishlist')
export class WishlistController {
  constructor(
    private readonly getWishlistsByOwnerUseCase: GetWishlistsByOwnerUseCase,
    private readonly getWishlistByIdUseCase: GetWishlistByIdUseCase,
    private readonly createWishlistUseCase: CreateWishlistUseCase,
    private readonly updateWishlistUseCase: UpdateWishlistUseCase,
    private readonly deleteWishlistUseCase: DeleteWishlistUseCase,
    private readonly linkWishlistToEventUseCase: LinkWishlistToEventUseCase,
    private readonly unlinkWishlistFromEventUseCase: UnlinkWishlistFromEventUseCase,
    private readonly uploadWishlistLogoUseCase: UploadWishlistLogoUseCase,
    private readonly removeWishlistLogoUseCase: RemoveWishlistLogoUseCase,
    private readonly addCoOwnerUseCase: AddCoOwnerUseCase,
    private readonly removeCoOwnerUseCase: RemoveCoOwnerUseCase,
  ) {}

  @Get()
  getMyWishlists(
    @Query() queryParams: GetPaginationQueryDto,
    @CurrentUser('id') currentUserId: UserId,
  ): Promise<PagedResponse<WishlistWithEventsDto>> {
    return this.getWishlistsByOwnerUseCase.execute({
      ownerId: currentUserId,
      pageNumber: queryParams.p ?? 1,
      pageSize: DEFAULT_RESULT_NUMBER,
    })
  }

  @Get('/:id')
  getWishlistById(
    @Param('id') wishlistId: WishlistId,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<DetailedWishlistDto> {
    return this.getWishlistByIdUseCase.execute({ wishlistId, currentUser })
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
    return this.createWishlistUseCase.execute({
      currentUser,
      newWishlist: {
        title: dto.title,
        description: dto.description,
        eventIds: dto.event_ids,
        hideItems: dto.hide_items,
        imageFile,
      },
    })
  }

  @Put('/:id')
  updateWishlist(
    @Param('id') wishlistId: WishlistId,
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: UpdateWishlistInputDto,
  ): Promise<void> {
    return this.updateWishlistUseCase.execute({
      wishlistId,
      currentUser,
      updateWishlist: { title: dto.title, description: dto.description },
    })
  }

  @Delete('/:id')
  async deleteWishlist(@Param('id') wishlistId: WishlistId, @CurrentUser() currentUser: ICurrentUser): Promise<void> {
    await this.deleteWishlistUseCase.execute({ wishlistId, currentUser })
  }

  @Post('/:id/link-event')
  @ApiOperation({ summary: 'This endpoint has for purpose to link a wishlist for a given event' })
  async linkWishlistToAnEvent(
    @Param('id') wishlistId: WishlistId,
    @Body() dto: LinkUnlinkWishlistInputDto,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<void> {
    await this.linkWishlistToEventUseCase.execute({ wishlistId, currentUser, eventId: dto.event_id })
  }

  @Post('/:id/unlink-event')
  @ApiOperation({ summary: 'This endpoint has for purpose to unlink a wishlist for a given event' })
  async unlinkWishlistToAnEvent(
    @Param('id') wishlistId: WishlistId,
    @Body() dto: LinkUnlinkWishlistInputDto,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<void> {
    await this.unlinkWishlistFromEventUseCase.execute({ wishlistId, currentUser, eventId: dto.event_id })
  }

  @Post('/:id/upload-logo')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  uploadLogo(
    @Param('id') wishlistId: WishlistId,
    @CurrentUser() currentUser: ICurrentUser,
    @UploadedFile(wishlistLogoFileValidators(true), wishlistLogoResizePipe(true))
    file: Express.Multer.File,
  ): Promise<UpdateWishlistLogoOutputDto> {
    return this.uploadWishlistLogoUseCase.execute({ wishlistId, currentUser, file })
  }

  @Delete('/:id/logo')
  async removeLogo(@Param('id') wishlistId: WishlistId, @CurrentUser() currentUser: ICurrentUser): Promise<void> {
    await this.removeWishlistLogoUseCase.execute({ wishlistId, currentUser })
  }

  @Post('/:id/co-owner')
  @ApiOperation({ summary: 'Add a co-owner to a public wishlist' })
  async addCoOwner(
    @Param('id') wishlistId: WishlistId,
    @Body() dto: AddCoOwnerInputDto,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<void> {
    await this.addCoOwnerUseCase.execute({ wishlistId, currentUser, coOwnerId: dto.user_id })
  }

  @Delete('/:id/co-owner')
  @ApiOperation({ summary: 'Remove the co-owner from a wishlist' })
  async removeCoOwner(@Param('id') wishlistId: WishlistId, @CurrentUser() currentUser: ICurrentUser): Promise<void> {
    await this.removeCoOwnerUseCase.execute({ wishlistId, currentUser })
  }
}
