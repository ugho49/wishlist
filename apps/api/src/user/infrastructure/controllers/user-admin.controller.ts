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

import { DeleteUserUseCase } from '../../application/command/delete-user.use-case'
import { RemoveUserPictureUseCase } from '../../application/command/remove-user-picture.use-case'
import { UpdateUserFullUseCase } from '../../application/command/update-user-full.use-case'
import { UpdateUserPictureUseCase } from '../../application/command/update-user-picture.use-case'
import { GetUserByIdUseCase } from '../../application/query/get-user-by-id.use-case'
import { GetUsersPaginatedUseCase } from '../../application/query/get-users-paginated.use-case'

@IsAdmin()
@ApiTags('ADMIN - User')
@Controller('/admin/user')
export class UserAdminController {
  constructor(
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly getUsersPaginatedUseCase: GetUsersPaginatedUseCase,
    private readonly updateUserFullUseCase: UpdateUserFullUseCase,
    private readonly updateUserPictureUseCase: UpdateUserPictureUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly removeUserPictureUseCase: RemoveUserPictureUseCase,
  ) {}

  @Get('/:id')
  getUserById(@Param('id') id: UserId): Promise<UserDto> {
    return this.getUserByIdUseCase.execute({ userId: id })
  }

  @Get()
  getAllPaginated(@Query() queryParams: GetAllUsersQueryDto): Promise<PagedResponse<UserWithoutSocialsDto>> {
    return this.getUsersPaginatedUseCase.execute({
      pageNumber: queryParams.p ?? 1,
      criteria: queryParams.q,
    })
  }

  @Patch('/:id')
  async updateFullUserProfile(
    @Param('id') userId: UserId,
    @Body() dto: UpdateFullUserProfileInputDto,
    @CurrentUser() currentUser: ICurrentUser,
  ): Promise<void> {
    await this.updateUserFullUseCase.execute({
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
    })
  }

  @Delete('/:id')
  async deleteUserById(@Param('id') userId: UserId, @CurrentUser() currentUser: ICurrentUser): Promise<void> {
    await this.deleteUserUseCase.execute({ userId, currentUser })
  }

  @Post('/:id/upload-picture')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPicture(
    @Param('id') userId: UserId,
    @UploadedFile(userPictureFileValidators, userPictureResizePipe)
    file: Express.Multer.File,
  ): Promise<UpdateUserPictureOutputDto> {
    const result = await this.updateUserPictureUseCase.execute({ userId, file })
    return { picture_url: result.pictureUrl }
  }

  @Delete('/:id/picture')
  async removePicture(@Param('id') userId: UserId) {
    await this.removeUserPictureUseCase.execute({ userId })
  }
}
