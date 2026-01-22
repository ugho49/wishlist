import { Body, Controller, Get, Put } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { ICurrentUser, UpdateUserEmailSettingsInputDto, UserEmailSettingsDto } from '@wishlist/common'

import { CurrentUser } from '../../../auth'
import { UpdateUserEmailSettingUseCase } from '../../application/command/update-user-email-setting.use-case'
import { GetUserEmailSettingUseCase } from '../../application/query/get-user-email-setting.use-case'

@ApiTags('User Email settings')
@Controller('/user/email-settings')
export class UserEmailSettingsController {
  constructor(
    private readonly updateUserEmailSettingUseCase: UpdateUserEmailSettingUseCase,
    private readonly getUserEmailSettingUseCase: GetUserEmailSettingUseCase,
  ) {}

  @Get()
  getEmailSettings(@CurrentUser() currentUser: ICurrentUser): Promise<UserEmailSettingsDto> {
    return this.getUserEmailSettingUseCase.execute({ currentUser })
  }

  @Put()
  updateEmailSettings(
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: UpdateUserEmailSettingsInputDto,
  ): Promise<UserEmailSettingsDto> {
    return this.updateUserEmailSettingUseCase.execute({
      currentUser,
      dailyNewItemNotification: dto.daily_new_item_notification,
    })
  }
}
