import {
  type CreateWishlistHttpResponse,
  type ICurrentUser,
  type UploadWishlistLogoHttpResponse,
  type WishlistId,
} from '@wishlist/common';
import { Body, Controller, Param, Post, UploadedFile } from '@znight/http';
import { ApiTags } from '@znight/openapi';

import { Authenticated } from '../../../auth/infrastructure/decorators/public.metadata';
import { CurrentUser } from '../../../auth/infrastructure/decorators/user.decorator';
import { ImageResizer, MAX_IMAGE_SIZE } from '../../../core/bucket/image-resizer';
import { CreateWishlistUseCase } from '../../application/command/create-wishlist.use-case';
import { UploadWishlistLogoUseCase } from '../../application/command/upload-wishlist-logo.use-case';
import { type CreateWishlistForm, CreateWishlistFormSchema } from '../wishlist-http.schema';

const LOGO_SIZE = { width: 500, height: 500 };

@ApiTags('Wishlist')
@Controller('/wishlist')
@Authenticated()
export class WishlistController {
  constructor(
    private readonly createWishlistUseCase: CreateWishlistUseCase,
    private readonly uploadWishlistLogoUseCase: UploadWishlistLogoUseCase,
    private readonly imageResizer: ImageResizer,
  ) {}

  @Post()
  async createWishlistWithLogo(
    @CurrentUser() currentUser: ICurrentUser,
    @Body(CreateWishlistFormSchema) form: CreateWishlistForm,
    @UploadedFile('image', { maxSize: MAX_IMAGE_SIZE }) imageFile?: File,
  ): Promise<CreateWishlistHttpResponse> {
    const dto = form.data;
    const wishlist = await this.createWishlistUseCase.execute({
      currentUser,
      newWishlist: {
        title: dto.title,
        description: dto.description,
        eventIds: dto.event_ids,
        hideItems: dto.hide_items,
        imageFile: imageFile ? await this.imageResizer.resize(imageFile, LOGO_SIZE) : undefined,
      },
    });

    return { id: wishlist.id };
  }

  @Post('/:id/upload-logo')
  async uploadLogo(
    @Param('id') wishlistId: WishlistId,
    @CurrentUser() currentUser: ICurrentUser,
    @UploadedFile('file', { maxSize: MAX_IMAGE_SIZE }) file: File,
  ): Promise<UploadWishlistLogoHttpResponse> {
    const resized = await this.imageResizer.resize(file, LOGO_SIZE);
    const { logoUrl } = await this.uploadWishlistLogoUseCase.execute({ wishlistId, currentUser, file: resized });
    return { logo_url: logoUrl };
  }
}
