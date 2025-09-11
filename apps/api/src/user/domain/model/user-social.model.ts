import type { UserSocialId, UserSocialType } from '@wishlist/common'

import type { User } from './user.model'

export type UserSocialProps = {
  id: UserSocialId
  user: User
  email: string
  name?: string
  socialId: string
  socialType: UserSocialType
  pictureUrl?: string
  createdAt: Date
  updatedAt: Date
}

export class UserSocial {
  public readonly id: UserSocialId
  public readonly user: User
  public readonly email: string
  public readonly name?: string
  public readonly socialId: string
  public readonly socialType: UserSocialType
  public readonly pictureUrl?: string
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(props: UserSocialProps) {
    this.id = props.id
    this.user = props.user
    this.email = props.email
    this.name = props.name
    this.socialId = props.socialId
    this.socialType = props.socialType
    this.pictureUrl = props.pictureUrl
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static create(params: {
    id: UserSocialId
    user: User
    email: string
    name?: string
    socialId: string
    socialType: UserSocialType
    pictureUrl?: string
  }): UserSocial {
    const now = new Date()
    return new UserSocial({
      id: params.id,
      user: params.user,
      email: params.email,
      name: params.name,
      socialId: params.socialId,
      socialType: params.socialType,
      pictureUrl: params.pictureUrl,
      createdAt: now,
      updatedAt: now,
    })
  }

  updatePictureUrl(pictureUrl?: string): UserSocial {
    return new UserSocial({
      ...this,
      pictureUrl,
      updatedAt: new Date(),
    })
  }

  updateEmail(email: string): UserSocial {
    return new UserSocial({
      ...this,
      email,
      updatedAt: new Date(),
    })
  }

  updateName(name?: string): UserSocial {
    return new UserSocial({
      ...this,
      name,
      updatedAt: new Date(),
    })
  }
}
