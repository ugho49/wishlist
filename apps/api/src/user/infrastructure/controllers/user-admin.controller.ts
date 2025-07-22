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
  UserWithoutSocialsDto,
} from '@wishlist/common'

import { CurrentUser, IsAdmin } from '../../../auth'
import { userPictureFileValidators, userPictureResizePipe } from '../user.validator'

import 'multer'

import { CommandBus, QueryBus } from '@nestjs/cqrs'

import {
  DeleteUserCommand,
  GetUserByIdQuery,
  GetUsersPaginatedQuery,
  RemoveUserPictureCommand,
  UpdateUserFullCommand,
  UpdateUserPictureCommand,
} from '../../domain'

@IsAdmin()
@ApiTags('ADMIN - User')
@Controller('/admin/user')
export class UserAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('/:id')
  getUserById(@Param('id') id: UserId): Promise<UserDto> {
    return this.queryBus.execute(new GetUserByIdQuery({ userId: id }))
  }

  @Get()
  getAllPaginated(@Query() queryParams: GetAllUsersQueryDto): Promise<PagedResponse<UserWithoutSocialsDto>> {
    return this.queryBus.execute(
      new GetUsersPaginatedQuery({
        pageNumber: queryParams.p ?? 1,
        criteria: queryParams.q,
      }),
    )
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
  async deleteUserById(@Param('id') userId: UserId, @CurrentUser() currentUser: ICurrentUser): Promise<void> {
    await this.commandBus.execute(new DeleteUserCommand({ userId, currentUser }))
  }

  @Post('/:id/upload-picture')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPicture(
    @Param('id') userId: UserId,
    @UploadedFile(userPictureFileValidators, userPictureResizePipe)
    file: Express.Multer.File,
  ): Promise<UpdateUserPictureOutputDto> {
    const result = await this.commandBus.execute(new UpdateUserPictureCommand({ userId, file }))
    return { picture_url: result.pictureUrl }
  }

  @Delete('/:id/picture')
  async removePicture(@Param('id') userId: UserId) {
    await this.commandBus.execute(new RemoveUserPictureCommand({ userId }))
  }
}
