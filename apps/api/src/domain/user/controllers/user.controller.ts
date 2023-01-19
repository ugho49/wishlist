import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser, Public } from '../../auth';
import { UserService } from '../user.service';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import {
  ChangeUserPasswordInputDto,
  MiniUserDto,
  RegisterUserInputDto,
  RegisterUserWithGoogleInputDto,
  UpdateUserPictureOutputDto,
  UpdateUserProfileInputDto,
  UserDto,
} from '@wishlist/common-types';
import { RealIP } from 'nestjs-real-ip';
import { Express } from 'express';
import 'multer';

@ApiTags('User')
@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getInfos(@CurrentUser('id') currentUserId: string): Promise<UserDto> {
    return this.userService.findById(currentUserId);
  }

  @Public()
  @Post('/register')
  register(@Body() dto: RegisterUserInputDto, @RealIP() ip: string): Promise<MiniUserDto> {
    return this.userService.create({ dto, ip });
  }

  @Public()
  @Post('/register/google')
  registerWithGoogle(@Body() dto: RegisterUserWithGoogleInputDto, @RealIP() ip: string): Promise<MiniUserDto> {
    return this.userService.createFromGoogle({ dto, ip });
  }

  @Put()
  update(@CurrentUser('id') currentUserId: string, @Body() dto: UpdateUserProfileInputDto): Promise<void> {
    return this.userService.update({ currentUserId, dto });
  }

  @Put('/change-password')
  changePassword(@CurrentUser('id') currentUserId: string, @Body() dto: ChangeUserPasswordInputDto): Promise<void> {
    return this.userService.changeUserPassword({ currentUserId, dto });
  }

  @Get('/search')
  searchByKeyword(
    @CurrentUser('id') currentUserId: string,
    @Query('keyword') criteria: string
  ): Promise<MiniUserDto[]> {
    return this.userService.searchByKeyword({ currentUserId, criteria });
  }

  @Post('/upload-picture')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPicture(
    @CurrentUser('id') currentUserId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 4 }),
        ],
      })
    )
    file: Express.Multer.File
  ): Promise<UpdateUserPictureOutputDto> {
    return this.userService.uploadPicture({
      currentUserId,
      file,
    });
  }

  @Put('/picture')
  async updatePictureFromSocial(@CurrentUser('id') currentUserId: string, @Query('social_id') socialId: string) {
    await this.userService.updatePictureFromSocial({ currentUserId, socialId });
  }

  @Delete('/picture')
  async removePicture(@CurrentUser('id') currentUserId: string) {
    await this.userService.removePicture({ currentUserId });
  }
}
