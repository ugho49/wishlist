import { Body, Controller, Get, Put } from '@nestjs/common';
import { CurrentUser } from '../../auth';
import { ApiTags } from '@nestjs/swagger';
import { UpdateUserEmailSettingsInputDto, UserEmailSettingsDto } from '@wishlist/common-types';
import { UserEmailSettingsService } from '../services/user-email-settings.service';

@ApiTags('User Email settings')
@Controller('/user/email-settings')
export class UserEmailSettingsController {
  constructor(private readonly userEmailSettingsService: UserEmailSettingsService) {}

  @Get()
  async getEmailSettings(@CurrentUser('id') id: string): Promise<UserEmailSettingsDto> {
    return await this.userEmailSettingsService.findByUserId(id);
  }

  @Put()
  async updateEmailSettings(
    @CurrentUser('id') id: string,
    @Body() dto: UpdateUserEmailSettingsInputDto
  ): Promise<UserEmailSettingsDto> {
    return await this.userEmailSettingsService.update(id, dto);
  }
}
