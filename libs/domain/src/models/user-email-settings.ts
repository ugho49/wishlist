import { Brand, uuid } from '@wishlist/common'

import { UserId } from './user'

export type UserEmailSettingId = Brand<string, 'UserEmailSettingId'>

export class UserEmailSettings {
  public readonly id: UserEmailSettingId
  public readonly userId: UserId
  public readonly dailyNewItemNotification: boolean
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(props: {
    id: UserEmailSettingId
    userId: UserId
    dailyNewItemNotification: boolean
    createdAt?: Date
    updatedAt?: Date
  }) {
    this.id = props.id
    this.userId = props.userId
    this.dailyNewItemNotification = props.dailyNewItemNotification
    this.createdAt = props.createdAt ?? new Date()
    this.updatedAt = props.updatedAt ?? new Date()
  }

  static getNewId(): UserEmailSettingId {
    return uuid() as UserEmailSettingId
  }
}
