import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { CurrentUser, Public } from '../auth';
import { UserService } from './services/user.service';
import { ApiTags } from '@nestjs/swagger';
import {
  ChangeUserPasswordInputDto,
  MiniUserDto,
  RegisterUserInputDto,
  UpdateUserEmailSettingsInputDto,
  UpdateUserProfileInputDto,
  UserDto,
  UserEmailSettingsDto,
} from '@wishlist/common-types';
import { UserEmailSettingsService } from './services/user-email-settings.service';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userEmailSettingsService: UserEmailSettingsService
  ) {}

  @Get()
  async getInfos(@CurrentUser('id') id: string): Promise<UserDto> {
    return this.userService.findById(id);
  }

  @Public()
  @Post('/register')
  async register(@Body() dto: RegisterUserInputDto): Promise<UserDto> {
    return this.userService.create(dto);
  }

  @Put()
  async update(@CurrentUser('id') id: string, @Body() dto: UpdateUserProfileInputDto): Promise<void> {
    await this.userService.update(id, dto);
  }

  @Put('/change-password')
  async changePassword(@CurrentUser('id') id: string, @Body() dto: ChangeUserPasswordInputDto): Promise<void> {
    await this.userService.changeUserPassword(id, dto);
  }

  @Get('/search')
  async searchByKeyword(@CurrentUser('id') id: string, @Query('keyword') criteria: string): Promise<MiniUserDto[]> {
    return await this.userService.searchByKeyword(id, criteria);
  }

  @Get('/email-settings')
  async getEmailSettings(@CurrentUser('id') id: string): Promise<UserEmailSettingsDto> {
    return await this.userEmailSettingsService.findByUserId(id);
  }

  @Put('/email-settings')
  async updateEmailSettings(
    @CurrentUser('id') id: string,
    @Body() dto: UpdateUserEmailSettingsInputDto
  ): Promise<UserEmailSettingsDto> {
    return await this.userEmailSettingsService.update(id, dto);
  }
}
