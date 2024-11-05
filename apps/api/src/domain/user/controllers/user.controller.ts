import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiTags } from '@nestjs/swagger'
import {
  ChangeUserPasswordInputDto,
  MiniUserDto,
  RegisterUserInputDto,
  RegisterUserWithGoogleInputDto,
  UpdateUserPictureOutputDto,
  UpdateUserProfileInputDto,
  UserDto,
  UserId,
  UserSocialId,
} from '@wishlist/common-types'
import { Express } from 'express'
import { RealIP } from 'nestjs-real-ip'

import { CurrentUser, Public } from '../../auth'
import { UserService } from '../user.service'

import 'multer'

import { userPictureFileValidators, userPictureResizePipe } from '../user.validator'

@ApiTags('User')
@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getInfos(@CurrentUser('id') currentUserId: UserId): Promise<UserDto> {
    return this.userService.findById(currentUserId)
  }

  @Public()
  @HttpCode(201)
  @Post('/register')
  register(@Body() dto: RegisterUserInputDto, @RealIP() ip: string): Promise<MiniUserDto> {
    return this.userService.create({ dto, ip })
  }

  @Public()
  @Post('/register/google')
  registerWithGoogle(@Body() dto: RegisterUserWithGoogleInputDto, @RealIP() ip: string): Promise<MiniUserDto> {
    return this.userService.createFromGoogle({ dto, ip })
  }

  @Put()
  update(@CurrentUser('id') currentUserId: UserId, @Body() dto: UpdateUserProfileInputDto): Promise<void> {
    return this.userService.update({ currentUserId, dto })
  }

  @Put('/change-password')
  changePassword(@CurrentUser('id') currentUserId: UserId, @Body() dto: ChangeUserPasswordInputDto): Promise<void> {
    return this.userService.changeUserPassword({ currentUserId, dto })
  }

  @Get('/search')
  searchByKeyword(
    @CurrentUser('id') currentUserId: UserId,
    @Query('keyword') criteria: string,
  ): Promise<MiniUserDto[]> {
    return this.userService.searchByKeyword({ currentUserId, criteria })
  }

  @Post('/upload-picture')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPicture(
    @CurrentUser('id') currentUserId: UserId,
    @UploadedFile(userPictureFileValidators, userPictureResizePipe)
    file: Express.Multer.File,
  ): Promise<UpdateUserPictureOutputDto> {
    return this.userService.uploadPicture({
      userId: currentUserId,
      file,
    })
  }

  @Put('/picture')
  async updatePictureFromSocial(@CurrentUser('id') currentUserId: UserId, @Query('social_id') socialId: UserSocialId) {
    await this.userService.updatePictureFromSocial({ currentUserId, socialId })
  }

  @Delete('/picture')
  async removePicture(@CurrentUser('id') currentUserId: UserId) {
    await this.userService.removePicture({ userId: currentUserId })
  }
}
