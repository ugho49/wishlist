import type { UserEmailSettingId } from '@wishlist/common'
import type { User } from './user.model'

export type UserEmailSettingProps = {
  id: UserEmailSettingId
  user: User
  dailyNewItemNotification: boolean
  createdAt: Date
  updatedAt: Date
}

export class UserEmailSetting {
  public readonly id: UserEmailSettingId
  public readonly user: User
  public readonly dailyNewItemNotification: boolean
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(props: UserEmailSettingProps) {
    this.id = props.id
    this.user = props.user
    this.dailyNewItemNotification = props.dailyNewItemNotification
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static create(params: { id: UserEmailSettingId; user: User; dailyNewItemNotification?: boolean }): UserEmailSetting {
    const now = new Date()
    return new UserEmailSetting({
      id: params.id,
      user: params.user,
      dailyNewItemNotification: params.dailyNewItemNotification === undefined ? true : params.dailyNewItemNotification,
      createdAt: now,
      updatedAt: now,
    })
  }

  updatePreferences(params: { dailyNewItemNotification: boolean }): UserEmailSetting {
    return new UserEmailSetting({
      ...this,
      dailyNewItemNotification: params.dailyNewItemNotification,
      updatedAt: new Date(),
    })
  }
}
