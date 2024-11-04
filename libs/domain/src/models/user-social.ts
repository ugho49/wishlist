import { Brand, uuid } from '@wishlist/common'

import { UserSocialType } from '../enums'
import { UserId } from './user'

export type UserSocialId = Brand<string, 'UserSocialId'>

export class UserSocial {
  public readonly id: UserSocialId
  public readonly pictureUrl?: string
  public readonly externalProviderId: string
  public readonly userId: UserId
  public readonly socialType: UserSocialType
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(props: {
    id: UserSocialId
    pictureUrl?: string
    externalProviderId: string
    userId: UserId
    socialType: UserSocialType
    createdAt?: Date
    updatedAt?: Date
  }) {
    this.id = props.id
    this.pictureUrl = props.pictureUrl
    this.userId = props.userId
    this.externalProviderId = props.externalProviderId
    this.socialType = props.socialType
    this.createdAt = props.createdAt ?? new Date()
    this.updatedAt = props.updatedAt ?? new Date()
  }

  static getNewId(): UserSocialId {
    return uuid() as UserSocialId
  }
}
