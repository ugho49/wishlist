import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiConsumes, ApiTags } from '@nestjs/swagger'
import {
  GetAllUsersQueryDto,
  ICurrentUser,
  PagedResponse,
  UpdateFullUserProfileInputDto,
  UpdateUserPictureOutputDto,
  UserDto,
  UserId,
} from '@wishlist/common'

import { CurrentUser, IsAdmin } from '../../auth'
import { UserService } from '../user.service'
import { userPictureFileValidators, userPictureResizePipe } from '../user.validator'

import 'multer'

@IsAdmin()
@ApiTags('ADMIN - User')
@Controller('/admin/user')
export class UserAdminController {
  constructor(private readonly userService: UserService) {}

  @Get('/:id')
  getUserById(@Param('id') id: UserId): Promise<UserDto> {
    return this.userService.findById(id)
  }

  @Get()
  getAllPaginated(@Query() queryParams: GetAllUsersQueryDto): Promise<PagedResponse<UserDto>> {
    return this.userService.findAllByCriteriaPaginated({ pageNumber: queryParams.p || 1, criteria: queryParams.q })
  }

  @Patch('/:id')
  updateFullUserProfile(
    @Param('id') userId: UserId,
    @Body() dto: UpdateFullUserProfileInputDto,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<void> {
    return this.userService.updateProfileAsAdmin({ userId, currentUser, dto })
  }

  @Delete('/:id')
  deleteUserById(@Param('id') userId: UserId, @CurrentUser() currentUser: ICurrentUser): Promise<void> {
    return this.userService.delete({ userId, currentUser })
  }

  @Post('/:id/upload-picture')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPicture(
    @Param('id') userId: UserId,
    @UploadedFile(userPictureFileValidators, userPictureResizePipe)
    file: Express.Multer.File,
  ): Promise<UpdateUserPictureOutputDto> {
    return this.userService.uploadPicture({
      userId,
      file,
    })
  }

  @Delete('/:id/picture')
  async removePicture(@Param('id') userId: UserId) {
    await this.userService.removePicture({ userId })
  }
}
