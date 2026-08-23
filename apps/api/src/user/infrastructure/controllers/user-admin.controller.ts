import { Controller, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UpdateUserPictureOutputDto, type UserId } from '@wishlist/common';

import { IsAdmin } from '../../../auth/infrastructure/decorators/admin.decorator';
import { UpdateUserPictureUseCase } from '../../application/command/update-user-picture.use-case';
import { userPictureFileValidators, userPictureResizePipe } from '../user.validator';

import 'multer';

@IsAdmin()
@ApiTags('ADMIN - User')
@Controller('/admin/user')
export class UserAdminController {
  constructor(private readonly updateUserPictureUseCase: UpdateUserPictureUseCase) {}

  @Post('/:id/upload-picture')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPicture(
    @Param('id') userId: UserId,
    @UploadedFile(userPictureFileValidators, userPictureResizePipe)
    file: Express.Multer.File,
  ): Promise<UpdateUserPictureOutputDto> {
    const result = await this.updateUserPictureUseCase.execute({ userId, file });
    return { picture_url: result.pictureUrl };
  }
}
