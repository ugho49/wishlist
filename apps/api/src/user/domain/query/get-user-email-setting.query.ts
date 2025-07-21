import type { ICurrentUser, UserEmailSettingsDto } from '@wishlist/common'

import { Query } from '@nestjs-architects/typed-cqrs'

export type GetUserEmailSettingResult = UserEmailSettingsDto

export class GetUserEmailSettingQuery extends Query<GetUserEmailSettingResult> {
  public readonly currentUser: ICurrentUser

  constructor(props: { currentUser: ICurrentUser }) {
    super()
    this.currentUser = props.currentUser
  }
}
