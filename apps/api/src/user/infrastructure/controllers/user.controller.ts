import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UpdateUserPictureOutputDto, type UserId } from '@wishlist/common';

import { CurrentUser } from '../../../auth/infrastructure/decorators/user.decorator';
import { UpdateUserPictureUseCase } from '../../application/command/update-user-picture.use-case';
import { userPictureFileValidators, userPictureResizePipe } from '../user.validator';

import 'multer';

@ApiTags('User')
@Controller('/user')
export class UserController {
  constructor(private readonly updateUserPictureUseCase: UpdateUserPictureUseCase) {}

  @Post('/upload-picture')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPicture(
    @CurrentUser('id') currentUserId: UserId,
    @UploadedFile(userPictureFileValidators, userPictureResizePipe)
    file: Express.Multer.File,
  ): Promise<UpdateUserPictureOutputDto> {
    const result = await this.updateUserPictureUseCase.execute({ userId: currentUserId, file });
    return { picture_url: result.pictureUrl };
  }
}
