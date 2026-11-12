import { type UpdateUserPictureHttpResponse, type UserId } from '@wishlist/common';
import { Controller, Param, Post, UploadedFile } from '@znight/http';
import { ApiExclude } from '@znight/openapi';

import { IsAdmin } from '../../../auth/infrastructure/decorators/admin.decorator';
import { ImageResizer, MAX_IMAGE_SIZE } from '../../../core/bucket/image-resizer';
import { UpdateUserPictureUseCase } from '../../application/command/update-user-picture.use-case';

@IsAdmin()
@ApiExclude()
@Controller('/admin/user')
export class UserAdminController {
  constructor(
    private readonly updateUserPictureUseCase: UpdateUserPictureUseCase,
    private readonly imageResizer: ImageResizer,
  ) {}

  @Post('/:id/upload-picture')
  async uploadPicture(
    @Param('id') userId: UserId,
    @UploadedFile('file', { maxSize: MAX_IMAGE_SIZE }) file: File,
  ): Promise<UpdateUserPictureHttpResponse> {
    const resized = await this.imageResizer.resize(file, { width: 500, height: 500 });
    const result = await this.updateUserPictureUseCase.execute({ userId, file: resized });
    return { picture_url: result.pictureUrl };
  }
}
