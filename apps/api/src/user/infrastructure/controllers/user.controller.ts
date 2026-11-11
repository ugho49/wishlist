import { type UpdateUserPictureHttpResponse, type UserId } from '@wishlist/common';
import { Controller, Post, UploadedFile } from '@znight/http';
import { ApiTags } from '@znight/openapi';

import { Authenticated } from '../../../auth/infrastructure/decorators/public.metadata';
import { CurrentUserId } from '../../../auth/infrastructure/decorators/user.decorator';
import { ImageResizer, MAX_IMAGE_SIZE } from '../../../core/bucket/image-resizer';
import { UpdateUserPictureUseCase } from '../../application/command/update-user-picture.use-case';

@ApiTags('User')
@Controller('/user')
@Authenticated()
export class UserController {
  constructor(
    private readonly updateUserPictureUseCase: UpdateUserPictureUseCase,
    private readonly imageResizer: ImageResizer,
  ) {}

  @Post('/upload-picture')
  async uploadPicture(
    @CurrentUserId() currentUserId: UserId,
    @UploadedFile('file', { maxSize: MAX_IMAGE_SIZE }) file: File,
  ): Promise<UpdateUserPictureHttpResponse> {
    const resized = await this.imageResizer.resize(file, { width: 500, height: 500 });
    const result = await this.updateUserPictureUseCase.execute({ userId: currentUserId, file: resized });
    return { picture_url: result.pictureUrl };
  }
}
