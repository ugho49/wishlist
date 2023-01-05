import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { CurrentUser, Public } from '../../auth';
import { UserService } from '../user.service';
import { ApiTags } from '@nestjs/swagger';
import {
  ChangeUserPasswordInputDto,
  MiniUserDto,
  RegisterUserInputDto,
  RegisterUserWithGoogleInputDto,
  UpdateUserProfileInputDto,
  UserDto,
} from '@wishlist/common-types';
import { RealIP } from 'nestjs-real-ip';

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
}
