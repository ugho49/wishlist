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
  ICurrentUser,
  MiniUserDto,
  RegisterUserInputDto,
  RegisterUserWithGoogleInputDto,
  UpdateUserPictureOutputDto,
  UpdateUserProfileInputDto,
  UserDto,
  UserId,
  UserSocialId,
} from '@wishlist/common'
import { RealIP } from 'nestjs-real-ip'

import { CurrentUser, Public } from '../../../auth'

import 'multer'

import { CommandBus, QueryBus } from '@nestjs/cqrs'

import {
  CreateUserCommand,
  CreateUserFromGoogleCommand,
  GetUserByIdQuery,
  GetUsersByCriteriaQuery,
  RemoveUserPictureCommand,
  UpdateUserCommand,
  UpdateUserPasswordCommand,
  UpdateUserPictureCommand,
  UpdateUserPictureFromSocialCommand,
} from '../../domain'
import { userPictureFileValidators, userPictureResizePipe } from '../user.validator'

@ApiTags('User')
@Controller('/user')
export class UserController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  getInfos(@CurrentUser('id') currentUserId: UserId): Promise<UserDto> {
    return this.queryBus.execute(new GetUserByIdQuery({ userId: currentUserId }))
  }

  @Public()
  @HttpCode(201)
  @Post('/register')
  register(@Body() dto: RegisterUserInputDto, @RealIP() ip: string): Promise<MiniUserDto> {
    return this.commandBus.execute(
      new CreateUserCommand({
        ip,
        newUser: {
          email: dto.email,
          password: dto.password,
          firstname: dto.firstname,
          lastname: dto.lastname,
        },
      }),
    )
  }

  @Public()
  @HttpCode(201)
  @Post('/register/google')
  registerWithGoogle(@Body() dto: RegisterUserWithGoogleInputDto, @RealIP() ip: string): Promise<MiniUserDto> {
    return this.commandBus.execute(new CreateUserFromGoogleCommand({ credential: dto.credential, ip }))
  }

  @Put()
  async update(@CurrentUser('id') currentUserId: UserId, @Body() dto: UpdateUserProfileInputDto): Promise<void> {
    await this.commandBus.execute(
      new UpdateUserCommand({
        userId: currentUserId,
        updateUser: {
          firstname: dto.firstname,
          lastname: dto.lastname,
          birthday: dto.birthday,
        },
      }),
    )
  }

  @Put('/change-password')
  async changePassword(
    @CurrentUser('id') currentUserId: UserId,
    @Body() dto: ChangeUserPasswordInputDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new UpdateUserPasswordCommand({
        userId: currentUserId,
        oldPassword: dto.old_password,
        newPassword: dto.new_password,
      }),
    )
  }

  @Get('/search')
  searchByKeyword(
    @CurrentUser() currentUser: ICurrentUser,
    @Query('keyword') criteria: string,
  ): Promise<MiniUserDto[]> {
    return this.queryBus.execute(
      new GetUsersByCriteriaQuery({
        currentUser,
        criteria,
      }),
    )
  }

  @Post('/upload-picture')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPicture(
    @CurrentUser('id') currentUserId: UserId,
    @UploadedFile(userPictureFileValidators, userPictureResizePipe)
    file: Express.Multer.File,
  ): Promise<UpdateUserPictureOutputDto> {
    const result = await this.commandBus.execute(new UpdateUserPictureCommand({ userId: currentUserId, file }))
    return { picture_url: result.pictureUrl }
  }

  @Put('/picture')
  async updatePictureFromSocial(@CurrentUser('id') currentUserId: UserId, @Query('social_id') socialId: UserSocialId) {
    await this.commandBus.execute(new UpdateUserPictureFromSocialCommand({ userId: currentUserId, socialId }))
  }

  @Delete('/picture')
  async removePicture(@CurrentUser('id') currentUserId: UserId) {
    await this.commandBus.execute(new RemoveUserPictureCommand({ userId: currentUserId }))
  }
}
