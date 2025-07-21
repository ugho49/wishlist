import { Body, Controller, Get, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { UpdateUserEmailSettingsInputDto, UserEmailSettingsDto, UserId } from '@wishlist/common'

import { CurrentUser } from '../../../auth'
import { LegacyEmailSettingsService } from '../legacy-email-settings.service'

@ApiTags('User Email settings')
@Controller('/user/email-settings')
export class UserEmailSettingsController {
  constructor(private readonly userEmailSettingsService: LegacyEmailSettingsService) {}

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
