import { Body, Controller, Get, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { UpdateUserEmailSettingsInputDto, UserEmailSettingsDto, UserId } from '@wishlist/common'

import { CurrentUser } from '../auth'
import { EmailSettingsService } from './email-settings.service'

@ApiTags('User Email settings')
@Controller('/user/email-settings')
export class EmailSettingsController {
  constructor(private readonly userEmailSettingsService: EmailSettingsService) {}

  @Get()
  getEmailSettings(@CurrentUser('id') id: UserId): Promise<UserEmailSettingsDto> {
    return this.userEmailSettingsService.findByUserId(id)
  }

  @Put()
  updateEmailSettings(
    @CurrentUser('id') id: UserId,
    @Body() dto: UpdateUserEmailSettingsInputDto,
  ): Promise<UserEmailSettingsDto> {
    return this.userEmailSettingsService.update(id, dto)
  }
}
