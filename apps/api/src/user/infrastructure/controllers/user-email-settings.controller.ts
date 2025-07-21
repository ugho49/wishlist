import { Body, Controller, Get, Put } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { ApiTags } from '@nestjs/swagger'
import { ICurrentUser, UpdateUserEmailSettingsInputDto, UserEmailSettingsDto } from '@wishlist/common'

import { CurrentUser } from '../../../auth'
import { GetUserEmailSettingQuery, UpdateUserEmailSettingCommand } from '../../domain'

@ApiTags('User Email settings')
@Controller('/user/email-settings')
export class UserEmailSettingsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  getEmailSettings(@CurrentUser() currentUser: ICurrentUser): Promise<UserEmailSettingsDto> {
    return this.queryBus.execute(new GetUserEmailSettingQuery({ currentUser }))
  }

  @Put()
  updateEmailSettings(
    @CurrentUser() currentUser: ICurrentUser,
    @Body() dto: UpdateUserEmailSettingsInputDto,
  ): Promise<UserEmailSettingsDto> {
    return this.commandBus.execute(
      new UpdateUserEmailSettingCommand({ currentUser, dailyNewItemNotification: dto.daily_new_item_notification }),
    )
  }
}
