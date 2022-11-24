import { Body, Controller, Get, Put } from '@nestjs/common';
import { CurrentUser } from '../auth';
import { ApiTags } from '@nestjs/swagger';
import { UpdateUserEmailSettingsInputDto, UserEmailSettingsDto } from '@wishlist/common-types';
import { EmailSettingsService } from './email-settings.service';

@ApiTags('User Email settings')
@Controller('/user/email-settings')
export class EmailSettingsController {
  constructor(private readonly userEmailSettingsService: EmailSettingsService) {}

  @Get()
  getEmailSettings(@CurrentUser('id') id: string): Promise<UserEmailSettingsDto> {
    return this.userEmailSettingsService.findByUserId(id);
  }

  @Put()
  updateEmailSettings(
    @CurrentUser('id') id: string,
    @Body() dto: UpdateUserEmailSettingsInputDto
  ): Promise<UserEmailSettingsDto> {
    return this.userEmailSettingsService.update(id, dto);
  }
}
