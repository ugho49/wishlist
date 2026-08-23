import { Controller, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import {
  type CreateWishlistHttpResponse,
  CreateWishlistInputDto,
  type ICurrentUser,
  type UploadWishlistLogoHttpResponse,
  type WishlistId,
} from '@wishlist/common';

import { CurrentUser } from '../../../auth/infrastructure/decorators/user.decorator';
import { ValidJsonBody } from '../../../core/common/common.decorator';
import { CreateWishlistUseCase } from '../../application/command/create-wishlist.use-case';
import { UploadWishlistLogoUseCase } from '../../application/command/upload-wishlist-logo.use-case';
import { wishlistLogoFileValidators, wishlistLogoResizePipe } from '../wishlist.validator';

@ApiTags('Wishlist')
@Controller('/wishlist')
export class WishlistController {
  constructor(
    private readonly createWishlistUseCase: CreateWishlistUseCase,
    private readonly uploadWishlistLogoUseCase: UploadWishlistLogoUseCase,
  ) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  async createWishlistWithLogo(
    @CurrentUser() currentUser: ICurrentUser,
    @ValidJsonBody('data') dto: CreateWishlistInputDto,
    @UploadedFile(wishlistLogoFileValidators(false), wishlistLogoResizePipe(false))
    imageFile?: Express.Multer.File,
  ): Promise<CreateWishlistHttpResponse> {
    const wishlist = await this.createWishlistUseCase.execute({
      currentUser,
      newWishlist: {
        title: dto.title,
        description: dto.description,
        eventIds: dto.event_ids,
        hideItems: dto.hide_items,
        imageFile,
      },
    });

    return { id: wishlist.id };
  }

  @Post('/:id/upload-logo')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(
    @Param('id') wishlistId: WishlistId,
    @CurrentUser() currentUser: ICurrentUser,
    @UploadedFile(wishlistLogoFileValidators(true), wishlistLogoResizePipe(true))
    file: Express.Multer.File,
  ): Promise<UploadWishlistLogoHttpResponse> {
    const { logoUrl } = await this.uploadWishlistLogoUseCase.execute({ wishlistId, currentUser, file });
    return { logo_url: logoUrl };
  }
}
