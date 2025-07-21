import type { ICurrentUser, UserEmailSettingsDto } from '@wishlist/common'

import { Command } from '@nestjs-architects/typed-cqrs'

export type UpdateUserEmailSettingResult = UserEmailSettingsDto

export class UpdateUserEmailSettingCommand extends Command<UpdateUserEmailSettingResult> {
  public readonly currentUser: ICurrentUser
  public readonly dailyNewItemNotification: boolean

  constructor(props: { currentUser: ICurrentUser; dailyNewItemNotification: boolean }) {
    super()
    this.currentUser = props.currentUser
    this.dailyNewItemNotification = props.dailyNewItemNotification
  }
}
