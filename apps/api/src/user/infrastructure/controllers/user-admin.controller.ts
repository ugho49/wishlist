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

import { CurrentUser, IsAdmin } from '../../../auth'
import { LegacyUserService } from '../legacy-user.service'
import { userPictureFileValidators, userPictureResizePipe } from '../user.validator'

import 'multer'

import { CommandBus, QueryBus } from '@nestjs/cqrs'

import { GetUserByIdQuery, UpdateUserFullCommand } from '../../domain'

@IsAdmin()
@ApiTags('ADMIN - User')
@Controller('/admin/user')
export class UserAdminController {
  constructor(
    private readonly userService: LegacyUserService,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('/:id')
  getUserById(@Param('id') id: UserId): Promise<UserDto> {
    return this.queryBus.execute(new GetUserByIdQuery({ userId: id }))
  }

  @Get()
  getAllPaginated(@Query() queryParams: GetAllUsersQueryDto): Promise<PagedResponse<UserDto>> {
    return this.userService.findAllByCriteriaPaginated({ pageNumber: queryParams.p || 1, criteria: queryParams.q })
  }

  @Patch('/:id')
  async updateFullUserProfile(
    @Param('id') userId: UserId,
    @Body() dto: UpdateFullUserProfileInputDto,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateUserFullCommand({
        userId,
        currentUser,
        updateUser: {
          email: dto.email,
          newPassword: dto.new_password,
          firstname: dto.firstname,
          lastname: dto.lastname,
          birthday: dto.birthday,
          isEnabled: dto.is_enabled,
        },
      }),
    )
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
