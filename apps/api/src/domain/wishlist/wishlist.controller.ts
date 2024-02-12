import { Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { CurrentUser } from '../auth';
import {
  CreateWishlistInputDto,
  DetailedWishlistDto,
  GetPaginationQueryDto,
  ICurrentUser,
  LinkUnlinkWishlistInputDto,
  PagedResponse,
  UpdateWishlistInputDto,
  UpdateWishlistLogoOutputDto,
  WishlistWithEventsDto,
} from '@wishlist/common-types';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { wishlistLogoFileValidators, wishlistLogoResizePipe } from './wishlist.validator';
import { ValidJsonBody } from '../../common/common.decorator';

@ApiTags('Wishlist')
@Controller('/wishlist')
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  getMyWishlists(
    @Query() queryParams: GetPaginationQueryDto,
    @CurrentUser('id') currentUserId: string,
  ): Promise<PagedResponse<WishlistWithEventsDto>> {
    return this.wishlistService.getMyWishlistPaginated({ pageNumber: queryParams.p || 1, currentUserId });
  }

  @Get('/:id')
  getWishlistById(
    @Param('id') wishlistId: string,
    @CurrentUser('id') currentUserId: string,
  ): Promise<DetailedWishlistDto> {
    return this.wishlistService.findById({ wishlistId, currentUserId });
  }

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  createWishlistWithLogo(
    @CurrentUser('id') currentUserId: string,
    @ValidJsonBody('data') dto: CreateWishlistInputDto,
    @UploadedFile(wishlistLogoFileValidators(false), wishlistLogoResizePipe(false))
    imageFile?: Express.Multer.File,
  ): Promise<unknown> {
    return this.wishlistService.create({ dto, currentUserId, imageFile });
  }

  @Put('/:id')
  updateWishlist(
    @Param('id') wishlistId: string,
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: UpdateWishlistInputDto,
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
    @CurrentUser('id') currentUserId: string,
  ): Promise<void> {
    return this.wishlistService.linkWishlistToAnEvent({ wishlistId, currentUserId, eventId: dto.event_id });
  }

  @Post('/:id/unlink-event')
  @ApiOperation({ summary: 'This endpoint has for purpose to unlink a wishlist for a given event' })
  unlinkWishlistToAnEvent(
    @Param('id') wishlistId: string,
    @Body() dto: LinkUnlinkWishlistInputDto,
    @CurrentUser('id') currentUserId: string,
  ): Promise<void> {
    return this.wishlistService.unlinkWishlistToAnEvent({ wishlistId, currentUserId, eventId: dto.event_id });
  }

  @Post('/:id/upload-logo')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(
    @Param('id') wishlistId: string,
    @CurrentUser('id') currentUserId: string,
    @UploadedFile(wishlistLogoFileValidators(true), wishlistLogoResizePipe(true))
    file: Express.Multer.File,
  ): Promise<UpdateWishlistLogoOutputDto> {
    return this.wishlistService.uploadLogo({
      wishlistId,
      currentUserId,
      file,
    });
  }

  @Delete('/:id/logo')
  async removeLogo(@Param('id') wishlistId: string, @CurrentUser('id') currentUserId: string): Promise<void> {
    await this.wishlistService.removeLogo({ wishlistId, currentUserId });
  }
}
