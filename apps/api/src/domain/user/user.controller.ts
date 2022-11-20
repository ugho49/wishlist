import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { CurrentUser, Public } from '../auth';
import { UserService } from './user.service';
import { ApiTags } from '@nestjs/swagger';
import {
  ChangeUserPasswordInputDto,
  RegisterUserInputDto,
  UpdateUserProfileInputDto,
  UserDto,
} from '@wishlist/common-types';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getInfos(@CurrentUser('id') id: string): Promise<UserDto> {
    return this.userService.findById(id);
  }

  @Public()
  @Post('/register')
  async register(@Body() dto: RegisterUserInputDto): Promise<UserDto> {
    return this.userService.save(dto);
  }

  @Put()
  async update(@CurrentUser('id') id: string, @Body() dto: UpdateUserProfileInputDto): Promise<void> {
    await this.userService.update(id, dto);
  }

  @Put('/change-password')
  async changePassword(@CurrentUser('id') id: string, @Body() dto: ChangeUserPasswordInputDto): Promise<void> {
    await this.userService.changeUserPassword(id, dto);
  }
}
