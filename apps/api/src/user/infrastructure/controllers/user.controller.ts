import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
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
  ICurrentUser,
  LimitQueryDto,
  LinkUserToGoogleInputDto,
  MiniUserDto,
  RegisterUserInputDto,
  UpdateUserPictureOutputDto,
  UpdateUserProfileInputDto,
  UserDto,
  UserId,
  UserSocialDto,
  UserSocialId,
} from '@wishlist/common'
import { RealIP } from 'nestjs-real-ip'

import { CurrentUser, Public } from '../../../auth'

import 'multer'

import { CreateUserUseCase } from '../../application/command/create-user.use-case'
import { LinkUserToGoogleUseCase } from '../../application/command/link-user-to-google.use-case'
import { RemoveUserPictureUseCase } from '../../application/command/remove-user-picture.use-case'
import { UnlinkUserSocialUseCase } from '../../application/command/unlink-user-social.use-case'
import { UpdateUserUseCase } from '../../application/command/update-user.use-case'
import { UpdateUserPasswordUseCase } from '../../application/command/update-user-password.use-case'
import { UpdateUserPictureUseCase } from '../../application/command/update-user-picture.use-case'
import { UpdateUserPictureFromSocialUseCase } from '../../application/command/update-user-picture-from-social.use-case'
import { GetClosestFriendsUseCase } from '../../application/query/get-closest-friends.use-case'
import { GetUserByIdUseCase } from '../../application/query/get-user-by-id.use-case'
import { GetUsersByCriteriaUseCase } from '../../application/query/get-users-by-criteria.use-case'
import { userPictureFileValidators, userPictureResizePipe } from '../user.validator'

@ApiTags('User')
@Controller('/user')
export class UserController {
  constructor(
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly getUsersByCriteriaUseCase: GetUsersByCriteriaUseCase,
    private readonly getClosestFriendsUseCase: GetClosestFriendsUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly linkUserToGoogleUseCase: LinkUserToGoogleUseCase,
    private readonly removeUserPictureUseCase: RemoveUserPictureUseCase,
    private readonly unlinkUserSocialUseCase: UnlinkUserSocialUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly updateUserPasswordUseCase: UpdateUserPasswordUseCase,
    private readonly updateUserPictureUseCase: UpdateUserPictureUseCase,
    private readonly updateUserPictureFromSocialUseCase: UpdateUserPictureFromSocialUseCase,
  ) {}

  @Get()
  getInfos(@CurrentUser('id') currentUserId: UserId): Promise<UserDto> {
    return this.getUserByIdUseCase.execute({ userId: currentUserId })
  }

  @Public()
  @HttpCode(201)
  @Post('/register')
  register(@Body() dto: RegisterUserInputDto, @RealIP() ip: string): Promise<MiniUserDto> {
    return this.createUserUseCase.execute({
      ip,
      newUser: {
        email: dto.email,
        password: dto.password,
        firstname: dto.firstname,
        lastname: dto.lastname,
      },
    })
  }

  @Post('/link-social/google')
  linkSocialWithGoogle(
    @CurrentUser('id') currentUserId: UserId,
    @Body() dto: LinkUserToGoogleInputDto,
  ): Promise<UserSocialDto> {
    return this.linkUserToGoogleUseCase.execute({ code: dto.code, userId: currentUserId })
  }

  @Delete('/unlink-social/:socialId')
  unlinkSocialAccount(
    @CurrentUser('id') currentUserId: UserId,
    @Param('socialId') socialId: UserSocialId,
  ): Promise<void> {
    return this.unlinkUserSocialUseCase.execute({ userId: currentUserId, socialId })
  }

  @Put()
  async update(@CurrentUser('id') currentUserId: UserId, @Body() dto: UpdateUserProfileInputDto): Promise<void> {
    await this.updateUserUseCase.execute({
      userId: currentUserId,
      updateUser: {
        firstname: dto.firstname,
        lastname: dto.lastname,
        birthday: dto.birthday,
      },
    })
  }

  @Put('/change-password')
  async changePassword(
    @CurrentUser('id') currentUserId: UserId,
    @Body() dto: ChangeUserPasswordInputDto,
  ): Promise<void> {
    await this.updateUserPasswordUseCase.execute({
      userId: currentUserId,
      oldPassword: dto.old_password,
      newPassword: dto.new_password,
    })
  }

  @Get('/search')
  searchByKeyword(
    @CurrentUser() currentUser: ICurrentUser,
    @Query('keyword') criteria: string,
  ): Promise<MiniUserDto[]> {
    return this.getUsersByCriteriaUseCase.execute({
      currentUser,
      criteria,
    })
  }

  @Get('/closest-friends')
  getClosestFriends(
    @CurrentUser('id') currentUserId: UserId,
    @Query() queryParams: LimitQueryDto,
  ): Promise<MiniUserDto[]> {
    return this.getClosestFriendsUseCase.execute({ userId: currentUserId, limit: queryParams.limit ?? 20 })
  }

  @Post('/upload-picture')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPicture(
    @CurrentUser('id') currentUserId: UserId,
    @UploadedFile(userPictureFileValidators, userPictureResizePipe)
    file: Express.Multer.File,
  ): Promise<UpdateUserPictureOutputDto> {
    const result = await this.updateUserPictureUseCase.execute({ userId: currentUserId, file })
    return { picture_url: result.pictureUrl }
  }

  @Put('/picture')
  async updatePictureFromSocial(@CurrentUser('id') currentUserId: UserId, @Query('social_id') socialId: UserSocialId) {
    await this.updateUserPictureFromSocialUseCase.execute({ userId: currentUserId, socialId })
  }

  @Delete('/picture')
  async removePicture(@CurrentUser('id') currentUserId: UserId) {
    await this.removeUserPictureUseCase.execute({ userId: currentUserId })
  }
}
