import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { CurrentUser, Public } from '../../auth';
import { UserService } from '../user.service';
import { ApiTags } from '@nestjs/swagger';
import {
  ChangeUserPasswordInputDto,
  MiniUserDto,
  RegisterUserInputDto,
  UpdateUserProfileInputDto,
  UserDto,
} from '@wishlist/common-types';

@ApiTags('User')
@Controller('/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getInfos(@CurrentUser('id') currentUserId: string): Promise<UserDto> {
    return this.userService.findById(currentUserId);
  }

  @Public()
  @Post('/register')
  async register(@Body() dto: RegisterUserInputDto): Promise<UserDto> {
    return this.userService.create(dto);
  }

  @Put()
  async update(@CurrentUser('id') currentUserId: string, @Body() dto: UpdateUserProfileInputDto): Promise<void> {
    await this.userService.update({ currentUserId, dto });
  }

  @Put('/change-password')
  async changePassword(
    @CurrentUser('id') currentUserId: string,
    @Body() dto: ChangeUserPasswordInputDto
  ): Promise<void> {
    await this.userService.changeUserPassword({ currentUserId, dto });
  }

  @Get('/search')
  async searchByKeyword(
    @CurrentUser('id') currentUserId: string,
    @Query('keyword') criteria: string
  ): Promise<MiniUserDto[]> {
    return await this.userService.searchByKeyword({ currentUserId, criteria });
  }
}
